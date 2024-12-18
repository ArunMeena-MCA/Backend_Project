import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema  = new Schema(
    {
        videoFile: {
            type: String,  // cloudinary url
            required: true
        },
        title: {
            type: String,  // cloudinary url
            required: true
        },
        thumbnail: {
            type: String,  // cloudinary url
            required: true
        },
        description: {
            type: String, 
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "user"
        },
        duration: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        ispublished: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)