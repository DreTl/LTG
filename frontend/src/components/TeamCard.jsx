import { FaEdit, FaTrash } from 'react-icons/fa';
import TeamAvatar from './TeamAvatar';

export default function TeamCard({ team, onEdit, onDelete }) {
  return (
    <div className="glass-card glass-card-hover p-4 text-center">
      <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center">
        <TeamAvatar name={team.name} logo={team.logo} size={80} fontFamily="inherit" />
      </div>
      <h5 className="font-semibold text-white mb-3">{team.name}</h5>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => onEdit(team)}
          className="btn btn-sm btn-outline-primary flex items-center gap-1 px-3"
        >
          <FaEdit size={12} /> Edit
        </button>
        <button
          onClick={() => onDelete(team)}
          className="btn btn-sm btn-outline-danger flex items-center gap-1 px-3"
        >
          <FaTrash size={12} /> Delete
        </button>
      </div>
    </div>
  );
}
