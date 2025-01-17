import {Router} from "express";
import { getAllVideos,
    getVideoById,
    publishVideo,
    updateVideo,
    deleteVideo,
    togglePublishStatus } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/publish").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    publishVideo
)
// .get(getAllVideos);

router.route("/getAllVideos").get(getAllVideos);
router.route("/:videoId").get(getVideoById);
router.route("/:videoId").patch(upload.single("thumbnail"),updateVideo);
router.route("/:videoId").delete(deleteVideo);
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router


