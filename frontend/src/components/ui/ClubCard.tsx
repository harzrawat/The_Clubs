import { useState } from "react";


interface ClubCardprops{
    name: string;
    description: string;
    member_count:number;
}

function ClubCard({name, description, member_count}: ClubCardprops) {

    const [isMember, setIsMember] = useState(false);

    const handleJoin = () => {
        setIsMember(true);
    };

    const handleLeave = () => {
        setIsMember(false);
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-xl font-bold">{name}</h2>
            <p className="text-gray-500">{description}</p>
            <div className="flex justify-between mt-4">
                <p className="text-gray-500">{member_count} members</p>
                {isMember ? (
                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded" onClick={handleLeave}>
                        Leave
                    </button>
                ) : (
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded" onClick={handleJoin}>
                        Join
                    </button>
                )}
            </div>
        </div>
    );
}

export default ClubCard;
