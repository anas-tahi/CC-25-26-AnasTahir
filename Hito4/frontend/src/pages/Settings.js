import { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import { authAPI } from '../services/api';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext';

const Settings = () => {
  const { user, setUser, fetchUser } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!user) fetchUser();
  }, [user, fetchUser]);

  const handleChange = (e) =>
    setUser({ ...user, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) =>
    setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const res = await authAPI.put('/update', user);
      setUser(res.data);

      Swal.fire('✅ Saved!', 'Your profile has been updated.', 'success');
    } catch (err) {
      Swal.fire('❌ Error', 'Could not update profile.', 'error');
    }
  };

  const handlePasswordSubmit = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return Swal.fire('⚠️ Missing Fields', 'Please fill out all password fields.', 'warning');
    }

    if (newPassword !== confirmPassword) {
      return Swal.fire('❌ Mismatch', 'New passwords do not match.', 'error');
    }

    try {
      await authAPI.put('/change-password', { currentPassword, newPassword });

      Swal.fire('✅ Password Changed', 'Your password has been updated.', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      Swal.fire('❌ Error', 'Could not change password.', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    const { value: phrase } = await Swal.fire({
      title: '🗑️ Delete Account',
      html: `
        <p style="margin-bottom:10px;">To confirm, type:</p>
        <b>"delete my account"</b>
        <input id="confirmInput" class="swal2-input" placeholder="Type here...">
      `,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#e74c3c',
      preConfirm: () => {
        const input = document.getElementById('confirmInput').value;
        if (input !== 'delete my account') {
          Swal.showValidationMessage('❌ You must type the exact phrase.');
          return false;
        }
        return input;
      }
    });

    if (!phrase) return;

    try {
      await authAPI.delete('/delete');
      localStorage.removeItem('token');

      Swal.fire({
        title: '✅ Account Deleted',
        text: 'Your account has been removed successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = '/';
      });

    } catch (err) {
      Swal.fire('❌ Error', 'Could not delete account.', 'error');
    }
  };

  if (!user) return <div className="settings-loading">Loading user info...</div>;

  return (
    <div className="settings-container">
      <h1 className="settings-title">⚙️ Account Settings</h1>

      {/* Profile */}
      <section className="settings-card fade-in">
        <h2>📝 Profile</h2>
        <div className="settings-form">
          <label>Name:</label>
          <input type="text" name="name" value={user.name} onChange={handleChange} />

          <label>Email:</label>
          <input type="email" name="email" value={user.email} onChange={handleChange} />

          <label>User ID:</label>
          <input type="text" value={user._id} disabled className="disabled-input" />

          <button onClick={handleSave} className="settings-btn primary-btn">
            Save Changes
          </button>
        </div>
      </section>

      {/* Password */}
      <section className="settings-card fade-in delay-1">
        <h2>🔐 Change Password</h2>
        <div className="settings-form">
          <label>Current Password:</label>
          <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} />

          <label>New Password:</label>
          <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} />

          <label>Confirm New Password:</label>
          <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} />

          <button onClick={handlePasswordSubmit} className="settings-btn success-btn">
            Update Password
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="settings-card fade-in delay-2">
        <h2>🗑️ Danger Zone</h2>
        <button onClick={handleDeleteAccount} className="settings-btn danger-btn pulse-danger">
          Delete Account
        </button>
      </section>
    </div>
  );
};

export default Settings;
