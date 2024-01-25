const autoBind = require("auto-bind");

class CollaborationsHandler {
    constructor(collaborationsService, playlistsService, validator) {
        this._collaborationsService = collaborationsService;
        this._playlistService = playlistsService; 
        this._validator = validator;

        autoBind(this);
    }

    async postCollaborationHandler(request, h) {
        this._validator.validateCollaborationPayload(request.payload);
        const { id: username } = request.auth.credentials;
        const { playlistId, userId } = request.payload;

        await this._playlistService.verifyPlaylistOwner(playlistId, username);
        const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);

        const response = h.response({
            status: 'success',
            message: 'Kolaborasi berhasil ditambahkan',
            data: {
                collaborationId,
            },
        });
        response.code(201);
        return response;
    }

    async deleteCollaborationHandler(request, h) {
        this._validator.validateCollaborationPayload(request.payload);
        const { id: username } = request.auth.credentials;
        const { playlistId, userId } = request.payload;

        await this._playlistService.verifyPlaylistOwner(playlistId, username);
        await this._collaborationsService.deleteCollaboration(playlistId, userId);

        return {
            status: 'success',
            message: 'Kolaborasi berhasil dihapus',
        };
    }
    async getCollaborationActivitiesHandler(request, h) {
        const { id: playlistId } = request.params;
    
        const playlistExists = await this._playlistService.verifyPlaylistOwner(playlistId, request.auth.credentials.id);
    
        if (playlistExists) {
            const activities = await this._collaborationsService.getCollaborationActivities(playlistId);
    
            return {
                status: 'success',
                data: {
                    playlistId,
                    activities,
                },
            };
        } else {
            return h.response({
                status: 'fail',
                message: 'Forbidden',
            }).code(403);
        }
    }    
}

module.exports = CollaborationsHandler;
