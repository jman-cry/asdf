import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, UserPlus, Search, Mail } from 'lucide-react';

interface Friend {
  _id: string;
  username: string;
  email: string;
}

const Friends: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingFriend, setAddingFriend] = useState(false);
  const [friendId, setFriendId] = useState('');

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await axios.get('/api/friends');
      setFriends(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch friends');
    } finally {
      setLoading(false);
    }
  };

  const addFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendId.trim()) return;

    setAddingFriend(true);
    try {
      await axios.post(`/api/friends/add/${friendId}`);
      toast.success('Friend added successfully!');
      setFriendId('');
      fetchFriends();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add friend');
    } finally {
      setAddingFriend(false);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Friends</h1>
      </div>

      {/* Add Friend Form */}
      <div className="card">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Add New Friend</h2>
        <form onSubmit={addFriend} className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={friendId}
              onChange={(e) => setFriendId(e.target.value)}
              placeholder="Enter friend's user ID"
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={addingFriend || !friendId.trim()}
            className="btn-primary flex items-center"
          >
            {addingFriend ? (
              <div className="loading-spinner h-4 w-4 mr-2"></div>
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            Add Friend
          </button>
        </form>
        <p className="text-sm text-secondary-600 mt-2">
          Ask your friend for their user ID to add them to your friends list.
        </p>
      </div>

      {/* Search Friends */}
      {friends.length > 0 && (
        <div className="card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search friends..."
              className="input-field pl-10"
            />
          </div>
        </div>
      )}

      {/* Friends List */}
      <div>
        {friends.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No friends yet</h3>
            <p className="text-secondary-600 mb-6">
              Start building your study network by adding friends. You can collaborate on projects and join group video calls together.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFriends.map((friend) => (
              <div key={friend._id} className="card hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900">{friend.username}</h3>
                    <div className="flex items-center text-sm text-secondary-600">
                      <Mail className="h-3 w-3 mr-1" />
                      {friend.email}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-secondary-200">
                  <p className="text-xs text-secondary-500">
                    User ID: {friend._id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {friends.length > 0 && filteredFriends.length === 0 && (
          <div className="card text-center py-8">
            <p className="text-secondary-600">No friends match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;