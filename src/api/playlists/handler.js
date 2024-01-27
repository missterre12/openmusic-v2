const autoBind = require("auto-bind");

class PlaylistsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postPlaylistHandler(request, h) {
        const { name } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        this._validator.validatePlaylistPayload(request.payload);

        const playlistId = await this._service.addPlaylists({ name, owner: credentialId });

        const response = h.response({
            status: 'success',
            message: 'Playlist berhasil ditambahkan',
            data: {
                playlistId,
            },
        });
        response.code(201);
        return response;
    }
    
    async getPlaylistsHandler(request) {
        const { id: credentialId } = request.auth.credentials;
        const playlists = await this._service.getPlaylists(credentialId);
        
        console.log('Number of Playlists:', playlists.length);
    
        return {
            status: 'success',
            data: {
                playlists,
            },
        };
    }
    
    async deletePlaylistByIdHandler(request, h) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistOwner(id, credentialId);
        await this._service.deletePlaylistById(id, credentialId);

        return {
            status: 'success',
            message: 'Playlist berhasil dihapus',
        };
    }

    async postPlaylistSongsByIdHandler(request, h) {
        this._validator.validatePlaylistSongPayload(request.payload);
        const { id: playlistId } = request.params;
        const { songId } = request.payload;
        const { id: owner } = request.auth.credentials;
    
        await this._service.verifyPlaylistOwner(playlistId, owner);
        await this._service.verifySongIsExist(songId);
        await this._service.addPlaylistsSong(playlistId, songId);
    
        const response = h.response({
            status: 'success',
            message: 'Playlist song berhasil ditambahkan',
        });
        response.code(201);
        return response;
    }

    async getPlaylistSongsByIdHandler(request, h) {
        const { id } = request.params;
        const { id: owner } = request.auth.credentials;
    
        await this._service.verifyPlaylistOwner(id, owner);
    
        const playlist = await this._service.getPlaylistById(id);
        
        return {
            status: 'success',
            data: {
                playlist,
            },
        };
    }

    async deletePlaylistSongsByIdHandler(request, h) {
        this._validator.validatePlaylistSongPayload(request.payload);
        const { id: playlistId } = request.params;
        const { songId } = request.payload;
        const { id: owner } = request.auth.credentials;

        await this._service.verifyPlaylistOwner(playlistId, owner);
        await this._service.deletePlaylistSongById(playlistId, songId);

        return {
            status: 'success',
            message: 'Playlist song berhasil dihapus',
        };
    }

    async postCollaborationActivityHandler(request, h) {
        const { id: userId } = request.auth.credentials;
        const { playlistId, songId, action } = request.payload;

        await this.verifyPlaylistAccess(playlistId, userId);
        await this._collaborationsService.verifyCollaborator(playlistId, userId);

        await this._collaborationsService.addCollaborationActivity(playlistId, songId, userId, action);

        const response = h.response({
            status: 'success',
            message: 'Aktivitas kolaborasi berhasil ditambahkan',
        });
        response.code(201);
        return response;
    }

    async deleteCollaborationActivityHandler(request, h) {
        const { id: userId } = request.auth.credentials;
        const { playlistId, songId, action } = request.payload;

        await this.verifyPlaylistAccess(playlistId, userId);
        await this._collaborationsService.verifyCollaborator(playlistId, userId);

        await this._collaborationsService.deleteCollaborationActivity(playlistId, songId, userId, action);

        return {
            status: 'success',
            message: 'Aktivitas kolaborasi berhasil dihapus',
        };
    }
}

module.exports = PlaylistsHandler;