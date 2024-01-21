const { Pool } = require('pg'); 
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError')
const { mapDBToModelPlaylists } = require('../../utils');

class PlaylistsService {
    constructor() {
        this._pool = new Pool();
    }
    async addPlaylists({ name, owner }) {
        const id = nanoid(16);
    
        const query = {
          text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
          values: [id, name, owner],
        };
    
        const result = await this._pool.query(query);
    
        if (!result.rows[0].id) {
          const error = new InvariantError('Playlist gagal ditambahkan');
          return Boom.badRequest(error.message, { credentials: error });
        }
    
        return result.rows[0].id;
      }

    async getPlaylists(owner) {
        const query = {
            text: 'SELECT playlists.*, users.username FROM playlists INNER JOIN users ON playlists.owner=users.id WHERE playlists.owner = $1',
            values: [owner],
        };

        const result = await this._pool.query(query);
        const mapResult = result.rows.map(mapDBToModelPlaylists);

        return mapResult;
    }

    async getPlaylistById(id) {
        const query = {
            text: `
            SELECT 
                playlists.id, 
                playlists.name, 
                users.username, 
                ARRAY_AGG(
                JSON_BUILD_OBJECT(
                    'id', songs.id ,
                    'title', songs.title,
                    'performer', songs.performer
                )
                ORDER BY songs.title ASC
                ) songs
            FROM playlist_songs
            INNER JOIN playlists ON playlist_songs.playlist_id = playlists.id
            INNER JOIN users ON playlists.owner = users.id
            INNER JOIN songs ON playlist_songs.song_id = songs.id
            WHERE playlist_id = $1
            GROUP BY playlists.id, users.username`,
            values: [id],
        };
        const result = await this._pool.query(query);
        
        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }
        return result.rows[0];
    }

    async deletePlaylistById(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
        }
    }

    async addPlaylistsSong(playlistId, songId) {
        const id = nanoid(16);

        const query = {
            text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id', 
            values: [id, playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Playlist song gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    async deletePlaylistSongById(playlistId, songId) {
        const query = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
        }
    }

    async verifyPlaylistOwner(playlistId, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [playlistId],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }
        const playlist = result.rows[0];
        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses');
        }
    }

    async verifySongIsExist(songId) {
        const query = {
            text: `SELECT * FROM songs WHERE id = $1`,
            values: [songId],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Song tidak ditemukan');
        }
    }

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
        }
    }
}

module.exports = PlaylistsService;