import {Router} from 'express';
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from '../controllers/playlist.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/createPlaylist').post(verifyJWT,createPlaylist);
router.route('/getUserPlaylists/:userId').get(getUserPlaylists);
router.route('/getPlaylistById/:playlistId').get(getPlaylistById);
router.route('/playlist/:playlistId/video/:videoId').post(addVideoToPlaylist);
router.route('/playlist/:playlistId/video/:videoId').delete(removeVideoFromPlaylist);
router.route('/deletePlaylist/:playlistId').delete(deletePlaylist);
router.route('/updatePlaylist/:playlistId').put(updatePlaylist);


export default router
