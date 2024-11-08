import mongoose,{Schema} from "mongoose";

const likeSchema = new Schema({
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "user"
        }
    },
    {
        timestamps: true
    }
)

export const Likes = mongoose.model("Likes",likeSchema);