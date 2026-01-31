import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, ArrowLeft, Save, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import toast from '../utils/toast';
import './Profile.css';

export default function Profile() {
    const { user, login } = useAuth(); // We might need to update user context manually if not handled
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        full_name: '',
    });

    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                full_name: user.full_name || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            const originalData = {
                username: user?.username || '',
                email: user?.email || '',
                full_name: user?.full_name || '',
            };

            // Check if anything changed
            const changed =
                newData.email !== originalData.email ||
                newData.full_name !== originalData.full_name;

            setHasChanges(changed);
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!hasChanges || loading) return;

        setLoading(true);
        try {
            // Only send fields that can be updated
            const updateData = {
                email: formData.email,
                full_name: formData.full_name
            };

            await authAPI.updateProfile(updateData);

            // Update local storage user manually to reflect changes immediately
            // Note: authAPI.updateProfile already updates localStorage 
            // but we need to trigger a re-render or context update. 
            // The easiest way is often to reload or have context listen to storage,
            // but our context initializes on mount.
            // Ideally, AuthContext should expose an updateUser function.
            // For now, we'll rely on the fact that we might need to refresh 
            // or we can manually update the user object if we had access to setUser.
            // But useAuth only gives us login/signup/logout.
            // Let's reload to be safe and simple, or improved Context later.

            toast.success('Profile updated successfully');
            setHasChanges(false);

            // Optional: Redirect back to chat
            // navigate('/'); 

            // Force reload to update context for now (quick fix)
            window.location.reload();

        } catch (error) {
            console.error('Profile update error:', error);
            // Error is handled by interceptor toast usually, but we can double check
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <button className="back-button" onClick={() => navigate('/chat')}>
                        <ArrowLeft size={20} />
                        <span>Back to Chat</span>
                    </button>
                    <div className="profile-brand">
                        <Sparkles size={24} className="brand-icon" />
                        <h1>Account Settings</h1>
                    </div>
                </div>

                <div className="profile-card">
                    <div className="profile-avatar-large">
                        {formData.username?.[0]?.toUpperCase() || 'U'}
                    </div>

                    <div className="profile-info-header">
                        <h2>{formData.username}</h2>
                        <span className="profile-badge">Free Plan</span>
                    </div>

                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-group">
                            <label>Username</label>
                            <div className="input-wrapper disabled">
                                <User size={18} />
                                <input
                                    type="text"
                                    value={formData.username}
                                    disabled
                                    title="Username cannot be changed"
                                />
                            </div>
                            <p className="field-hint">Username cannot be changed</p>
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <Mail size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Full Name</label>
                            <div className="input-wrapper">
                                <User size={18} />
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className={`save-button ${hasChanges ? 'active' : ''}`}
                                disabled={!hasChanges || loading}
                            >
                                {loading ? (
                                    <span className="spinner"></span>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
