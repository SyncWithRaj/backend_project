import { Router } from "express";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

router.use(verifyJWT, upload.none()); // used for form-data and belowed one used for json data
// router.use(verifyJWT);

router.route("/:videoId")
    .get(getVideoComments)
    .post(addComment);
router.route("/c/:commentId")
    .delete(deleteComment)
    .patch(updateComment);

export default router;