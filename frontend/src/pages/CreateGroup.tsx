import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useConversationStore } from '../stores/conversationStore';
import { Users, Search, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateGroupFormData {
  name: string;
  description?: string;
}

const CreateGroup = () => {
  const { createGroup, loading } = useConversationStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  
  const { 
    register, 
    handleSubmit,
    formState: { errors, isValid } 
  } = useForm<CreateGroupFormData>({
    mode: 'onChange'
  });
  
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const response = await fetch(`/api/users/search?q=${value}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      
      const data = await response.json();
      // Filter out already selected users
      const filteredResults = data.filter(
        (user: any) => !selectedUsers.some(selected => selected._id === user._id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      toast.error('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };
  
  const selectUser = (user: any) => {
    setSelectedUsers(prev => [...prev, user]);
    setSearchResults(prev => prev.filter(u => u._id !== user._id));
    setSearchTerm('');
  };
  
  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user._id !== userId));
  };
  
  const onSubmit = async (data: CreateGroupFormData) => {
    if (selectedUsers.length < 2) {
      toast.error('Please select at least 2 users for the group');
      return;
    }
    
    try {
      const participantIds = selectedUsers.map(user => user._id);
      const group = await createGroup({
        name: data.name,
        description: data.description || '',
        participants: participantIds
      });
      
      toast.success('Group created successfully!');
      navigate(`/group/${group._id}`);
    } catch (error) {
      toast.error('Failed to create group');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <div className="bg-secondary-100 p-2 rounded-full mr-3">
            <Users className="h-6 w-6 text-secondary-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Create a New Group</h1>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Group Name*
            </label>
            <input
              id="name"
              type="text"
              className="input w-full"
              placeholder="Enter group name"
              {...register('name', { required: 'Group name is required' })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-error-500">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              rows={3}
              className="input w-full"
              placeholder="What's this group about?"
              {...register('description')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Participants*
            </label>
            
            {/* Selected users */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedUsers.map(user => (
                  <div
                    key={user._id}
                    className="flex items-center bg-gray-100 rounded-full pl-1 pr-2 py-1"
                  >
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=3B82F6&color=fff`}
                      alt={user.name}
                      className="h-6 w-6 rounded-full mr-1"
                    />
                    <span className="text-sm text-gray-800">{user.name}</span>
                    <button
                      type="button"
                      onClick={() => removeSelectedUser(user._id)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Search input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10 w-full"
                placeholder="Search users to add"
                value={searchTerm}
                onChange={handleSearch}
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-primary-600 rounded-full"></div>
                </div>
              )}
            </div>
            
            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white rounded-md shadow-lg max-h-56 overflow-y-auto">
                <ul className="py-1">
                  {searchResults.map(user => (
                    <li
                      key={user._id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => selectUser(user)}
                    >
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=3B82F6&color=fff`}
                        alt={user.name}
                        className="h-8 w-8 rounded-full mr-3"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <button type="button" className="text-primary-600">
                        <Plus className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {searchTerm && searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
              <p className="mt-2 text-sm text-gray-500">No users found. Try a different search term.</p>
            )}
            
            {selectedUsers.length < 2 && (
              <p className="mt-2 text-sm text-gray-500">Please select at least 2 users for the group.</p>
            )}
          </div>
          
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-outline mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !isValid || selectedUsers.length < 2}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                  Creating...
                </div>
              ) : (
                <>
                  <Users className="h-5 w-5 mr-2" />
                  Create Group
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;