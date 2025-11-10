// src/pages/Auth.js
import Register from '../components/Register';
import Login from '../components/Login';

const Auth = () => {
  return (
    <div>
      <h1>👤 User Access</h1>
      <Register />
      <hr />
      <Login />
    </div>
  );
};

export default Auth;
