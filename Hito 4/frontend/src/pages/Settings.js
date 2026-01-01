import { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import { authAPI } from '../services/api';
import { UserContext } from '../context/UserContext';   // ⭐ NEW

const Settings = () => {
  const { user, setUser, fetchUser } = useContext(UserContext); // ⭐ NEW
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // ⭐ Load user from context instead of fetching manually
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

      // ⭐ Update global user instantly
      setUser(res.data);

      Swal.fire('✅ Saved!', 'Your profile has been updated.', 'success');
    } catch (err) {
      console.error('❌ Failed to update user info:', err);
      Swal.fire('❌ Error', 'Could not update profile.', 'error');
    }
  };

  const handlePasswordSubmit = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return Swal.fire(
        '⚠️ Missing Fields',
        'Please fill out all password fields.',
        'warning'
      );
    }

    if (newPassword !== confirmPassword) {
      return Swal.fire('❌ Mismatch', 'New passwords do not match.', 'error');
    }

    try {
      await authAPI.put('/change-password', {
        currentPassword,
        newPassword,
      });

      Swal.fire('✅ Password Changed', 'Your password has been updated.', 'success');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('❌ Failed to change password:', err);
      Swal.fire('❌ Error', 'Could not change password.', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete your account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
    });

    if (!result.isConfirmed) return;

    try {
      await authAPI.delete('/delete');
      localStorage.removeItem('token');

      Swal.fire('✅ Account Deleted', 'Your account has been removed.', 'success').then(
        () => {
          window.location.href = '/register';
        }
      );
    } catch (err) {
      console.error('❌ Failed to delete account:', err);
      Swal.fire('❌ Error', 'Could not delete account.', 'error');
    }
  };

  if (!user) return <div style={styles.loading}>Loading user info...</div>;

  return (
    <div style={styles.container}>
      <style>{`
        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.6s forwards;
        }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }
        input:focus {
          border-color: #007bff;
          box-shadow: 0 0 8px rgba(0, 123, 255, 0.3);
          outline: none;
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .pulse-danger {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>

      <h1 style={styles.title}>⚙️ Account Settings</h1>

      <section style={styles.card} className="fade-in">
        <h2>📝 Profile</h2>
        <div style={styles.form}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            style={styles.input}
          />

          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            style={styles.input}
          />

          <label>User ID:</label>
          <input
            type="text"
            value={user._id}
            disabled
            style={{ ...styles.input, backgroundColor: '#f5f5f5' }}
          />

          <button onClick={handleSave} style={styles.button}>
            Save Changes
          </button>
        </div>
      </section>

      <section style={styles.card} className="fade-in delay-1">
        <h2>🔐 Change Password</h2>
        <div style={styles.form}>
          <label>Current Password:</label>
          <input
            type="password"
            name="currentPassword"
            value={passwords.currentPassword}
            onChange={handlePasswordChange}
            style={styles.input}
          />

          <label>New Password:</label>
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
            style={styles.input}
          />

          <label>Confirm New Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handlePasswordChange}
            style={styles.input}
          />

          <button
            onClick={handlePasswordSubmit}
            style={{ ...styles.button, backgroundColor: '#28a745' }}
          >
            Update Password
          </button>
        </div>
      </section>

      <section style={styles.card} className="fade-in delay-2">
        <h2>🗑️ Danger Zone</h2>
        <button
          onClick={handleDeleteAccount}
          style={{ ...styles.button, backgroundColor: '#dc3545' }}
          className="pulse-danger"
        >
          Delete Account
        </button>
      </section>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    alignItems: 'center',
  },
  title: {
    marginBottom: '1rem',
    fontSize: '2rem',
  },
  card: {
    width: '100%',
    maxWidth: '500px',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    transition: 'all 0.3s ease',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.6rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    transition: '0.3s',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: '0.3s',
  },
  loading: {
    padding: '2rem',
    fontSize: '1.2rem',
    textAlign: 'center',
  },
};

export default Settings;
  