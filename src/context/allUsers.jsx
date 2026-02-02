import PropTypes from 'prop-types';
import { useMemo, createContext, useContext, useEffect, useState } from 'react';
import { getAllUsers } from '@/services/users/getUsers';
import { useAuth } from '@/context/loginContext';

const UsersContext = createContext();

export function UsersProvider({ children }) {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user || loading) return;

    getAllUsers()
      .then(setUsers)
      .catch((err) => {
        console.error('UsersProvider error:', err);
        setUsers([]);
      });
  }, [user, loading]);

  const refreshUsers = async () => {
    try {
      const newUsers = await getAllUsers();
      setUsers(newUsers);
    } catch (err) {
      console.error('Error refreshing users:', err);
      setUsers([]);
    }
  };

  const value = useMemo(() => ({ users, refreshUsers }), [users]);

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
}

UsersProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useUsers() {
  return useContext(UsersContext);
}
