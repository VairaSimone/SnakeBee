import React, { useEffect, useState } from 'react';
import { getAccessibleWorkspaces } from '../services/api';

// Aggiungiamo la prop className
const WorkspaceSelector = ({ className = "" }) => {
    const [workspaces, setWorkspaces] = useState([]);
    const [currentWorkspace, setCurrentWorkspace] = useState(
        localStorage.getItem('operateAsId') || 'personal'
    );

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const res = await getAccessibleWorkspaces();
                setWorkspaces(res.data);
            } catch (error) {
                console.error("Errore nel recupero workspaces", error);
            }
        };
        fetchWorkspaces();
    }, []);

    const handleChange = (e) => {
        const selectedId = e.target.value;
        
        if (selectedId === 'personal') {
            localStorage.removeItem('operateAsId');
        } else {
            localStorage.setItem('operateAsId', selectedId);
        }
        
        setCurrentWorkspace(selectedId);
        window.location.reload(); 
    };

    if (workspaces.length === 0) return null;

    return (
        // Usiamo il className passato come prop
        <div className={`flex items-center ${className}`}>
            <span className="text-sm mr-2 text-gray-600 font-medium">Allevamento:</span>
            <select 
                value={currentWorkspace} 
                onChange={handleChange}
                className="text-sm border border-gray-300 rounded-md p-1.5 bg-white focus:ring-[#228B22] focus:outline-none w-full max-w-[150px] truncate"
            >
                <option value="personal">Il Mio Account</option>
                {workspaces.map(ws => (
                    <option key={ws._id} value={ws._id}>
                        {ws.name || ws.email}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default WorkspaceSelector;