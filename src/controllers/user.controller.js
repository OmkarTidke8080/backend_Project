import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import UserToken from "../models/UserToken.js";
import bcrypt from "bcrypt";

// const generateTokens = async (user) => {
//   try {
//     const payload = { _id: user._id };
//     const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
//       expiresIn: "14m",
//     });
//     const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
//       expiresIn: "30d",
//     });

//     const userToken = await UserToken.findOne({ userId: user._id });
//     if (userToken) await userToken.remove();

//     await new UserToken({ userId: user._id, token: refreshToken }).save();
//     return Promise.resolve({ accessToken, refreshToken });
//   } catch (err) {
//     return Promise.reject(err);
//   }
// };

const generateTokens = async (user) => {
  try {
    const payload = { _id: user._id };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "14m",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "30d",
    });

    const userToken = await UserToken.findOne({ userId: user._id });
    if (userToken) {
      await userToken.deleteOne();
    }

    await new UserToken({ userId: user._id, token: refreshToken }).save();
    return { accessToken, refreshToken };
  } catch (err) {
    throw new Error(`Token generation failed: ${err.message}`);
  }
};

// register user API
export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  //console.log("email: ", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  const salt = await bcrypt.genSalt(Number(process.env.SALT));
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  //console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password: hashPassword,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

// login  User api
export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  // const { error } = logInBodyValidation(req.body);
  // if (error)
  //   return res
  //     .status(400)
  //     .json({ error: true, message: error.details[0].message });

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const verifiedPassword = await bcrypt.compare(password, user.password);
  if (!verifiedPassword)
    return res
      .status(401)
      .json({ error: true, message: "Invalid email or password" });

  const { accessToken, refreshToken } = await generateTokens(user);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});
