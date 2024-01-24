exports.up = (pgm) => {
    pgm.createTable('collaboration_activities', {
    id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
    },
    playlist_id: {
        type: 'VARCHAR(50)',
        references: 'playlists(id)',
        onDelete: 'cascade',
    },
    username: {
        type: 'VARCHAR(50)',
        notNull: true,
    },
    action: {
        type: 'VARCHAR(10)',
        notNull: true,
    },
    title: {
        type: 'TEXT',
        notNull: true,
    },
    time: {
        type: 'TIMESTAMP',
        notNull: true,
        default: pgm.func('current_timestamp'),
    },
    });
  };
  
exports.down = (pgm) => {
    pgm.dropTable('collaboration_activities');
};
  