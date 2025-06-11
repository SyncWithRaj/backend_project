import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // TODO: toggle subscription

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId,
    })

    if (isSubscribed) {
        await Subscription.findByIdAndDelete(isSubscribed?._id);

        return res
            .status(200)
            .json(new ApiResponse(200, { subscribed: false }, "unsubscribed successfullly"))
    }

    await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { subscribed: true }, "subscribed successfullly"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscriber = asyncHandler(async (req, res) => {
    let { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid ChannelId`")
    }

    channelId = new mongoose.Types.ObjectId(channelId)

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: channelId,
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscription",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedToSubscriber"
                        }
                    },
                    {
                        $addFields: {
                            subscribedToSubscriber: {
                                $cond: {
                                    if: {
                                        $in: [
                                            channelId,
                                            "$subscribedToSubscriber.subscriber",
                                        ]
                                    },
                                    then: true,
                                    else: false,
                                }
                            },
                            subscriberCount: {
                                $size: "$subscribedToSubscriber",
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$subscriber",
        },
        {
            $project: {
                _id: 0,
                subscriber: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    subscribedToSubscriber: 1,
                    subscriberCount: 1
                }
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, subscribers, "subscribers fetched successfully"
            )
        )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {

})

export { toggleSubscription, getUserChannelSubscriber } 