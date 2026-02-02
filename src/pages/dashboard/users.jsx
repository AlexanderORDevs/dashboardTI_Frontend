import {
  Card,
  CardHeader,
  Typography,
  CardBody,
} from '@material-tailwind/react';
import { MdEdit, MdDelete } from 'react-icons/md';
import CustomSwal from '@/utils/customSwal';
import Label from '@/widgets/forms/label';
import Select from '@/widgets/forms/select';
import Option from '@/widgets/forms/option';
import Input from '@/widgets/forms/input';
import FormButtons from '@/components/uat/FormButtons';
import { useState, useEffect, useRef } from 'react';
import { getAllRoles } from '@/services/roles/getRoles';
import { useUsers } from '@/context/allUsers';
import { createUser } from '@/services/users/createUser';
import { updateUsers } from '@/services/users/updateUser';
import { getAllUsers } from '@/services/users/getUsers';
import { deleteUsers } from '@/services/users/deleteUser';
import ScaleWrapper from '@/components/ScaleWrapper';

const toTitleCase = (text) => {
  return text
    .toLowerCase()
    .split(' ')
    .filter((word) => word.trim() !== '')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function Users() {
  const createUsersRef = useRef(null);
  const { users, refreshUsers } = useUsers();
  const [localUsers, setLocalUsers] = useState(
    Array.isArray(users) ? users : []
  );

  useEffect(() => {
    setLocalUsers(Array.isArray(users) ? users : []);
  }, [users]);

  const [roles, setRoles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  //Add status for form
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role_id, setRole_id] = useState('');
  const [status, setStatus] = useState('active');
  const [username, setUsername] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const formDataUser = {
    fullname,
    email,
    password,
    phone,
    role_id,
    status,
    username,
  };

  //Functions
  const getRoleName = (id) => {
    const role = roles.find((role) => role.id === id);
    return role ? role.name : 'Unknown';
  };

  const reloadUsers = async () => {
    try {
      await refreshUsers();
      // localUsers se actualiza via useEffect
    } catch (err) {
      console.error('Error reloading users:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllRoles();
        setRoles(Array.isArray(data) ? data : []);
      } catch (error) {
        setRoles([]);
        console.error('Error fetching roles:', error);
      }
      setLocalUsers(Array.isArray(users) ? users : []);
    };

    fetchData();
  }, [users]);

  const handleEdit = (row) => {
    setFullname(row.fullname || '');
    setEmail(row.email || '');
    setUsername(row.username || '');
    setPhone(row.phone || '');
    setRole_id(row.role_id || '');
    setStatus(row.status || 'active');
    setEditingId(row.id ?? null);
    setTimeout(() => {
      createUsersRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 10);
    setIsEditing(true);
  };

  const handleDelete = (row) => {
    CustomSwal.fire({
      title: '¿Delete user??',
      text: `Confirm deletion of ${row.fullname || row.username || 'this user'}.`,
      icon: 'warning',
      confirmButtonText: 'Yes, delete',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUsers({ id: row.id })
          .then(() => {
            CustomSwal.fire({
              icon: 'success',
              title: 'Deleted',
              text: 'User deleted',
            });
            reloadUsers();
          })
          .catch((error) => {
            CustomSwal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error while deleting the user',
            });
            console.error('Error deleting user:', error);
          });
      }
    });
  };

  // Handler submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!fullname.trim()) errors.fullname = true;
    if (!username.trim()) errors.username = true;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = true;
    if (!role_id) errors.role_id = true;
    if (phone.trim() && phone.length !== 9) errors.phone = true;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      CustomSwal.fire({
        icon: 'error',
        title: 'Required Fields',
        text: 'Please fill in all required fields correctly.',
      });
      return;
    }

    const payload = { ...formDataUser, role_id: role_id };

    try {
      if (isEditing && editingId) {
        const updatePayload = { id: editingId, ...payload };
        await updateUsers(updatePayload);
        CustomSwal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Data updated successfully',
        });
        handleCancel();
        reloadUsers();
      } else {
        await createUser(payload);
        CustomSwal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Data saved successfully',
        });
        handleCancel();
        reloadUsers();
      }
      setIsEditing(false);
      setEditingId(null);
    } catch (error) {
      CustomSwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error while saving the data',
      });
      reloadUsers();
      console.error('Error submitting user:', error);
    }
  };

  // Handler for cancel
  const handleCancel = () => {
    setFullname('');
    setEmail('');
    setUsername('');
    setPassword('');
    setStatus('active');
    setRole_id('');
    setPhone('');
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <ScaleWrapper scale={0.6} buffer={40}>
      <div className="mb-8 mt-12 flex flex-col gap-8 text-sm">
        <div ref={createUsersRef} />
        <Card color="white">
          <CardHeader
            variant="gradient"
            color="gray"
            className="p-6 shadow-none"
          >
            <Typography variant="h4" color="white">
              Creates Users
            </Typography>
          </CardHeader>
          <form className="space-y-10 rounded-xl p-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 text-xs sm:grid-cols-6 sm:text-[10px]">
              {/* Full Name */}
              <div className="sm:col-span-3">
                <Label htmlFor="fullname">Full Name</Label>
                <Input
                  id="fullname"
                  name="fullname"
                  type="text"
                  value={fullname}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(
                      /[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g,
                      ''
                    );
                    setFullname(toTitleCase(cleaned));
                    setFieldErrors((prev) => ({ ...prev, fullname: false }));
                  }}
                  className={fieldErrors.fullname ? 'border-red-500' : ''}
                />
                {fieldErrors.fullname && (
                  <span className="mt-1 block text-xs text-red-500">
                    This field is required
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="sm:col-span-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: false }));
                  }}
                  className={fieldErrors.email ? 'border-red-500' : ''}
                />
                {fieldErrors.email && (
                  <span className="mt-1 block text-xs text-red-500">
                    This field is required
                  </span>
                )}
              </div>

              {/* Username */}
              <div className="sm:col-span-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(
                      /[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g,
                      ''
                    );
                    setUsername(toTitleCase(cleaned));
                    setFieldErrors((prev) => ({ ...prev, username: false }));
                  }}
                  className={fieldErrors.username ? 'border-red-500' : ''}
                />
                {fieldErrors.username && (
                  <span className="mt-1 block text-xs text-red-500">
                    This field is required
                  </span>
                )}
              </div>
              {/* Password */}
              <div className="sm:col-span-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {/* Position */}
              <div className="sm:col-span-3">
                <Label htmlFor="position">Position</Label>
                <Select
                  id="idRole"
                  name="idRole"
                  value={role_id}
                  onChange={(e) => {
                    setRole_id(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, role_id: false }));
                  }}
                >
                  className={fieldErrors.role_id ? 'border-red-500' : ''}
                  <Option value="" disabled hidden>
                    Select Role
                  </Option>
                  {roles.map((p) => (
                    <Option key={p.id} value={p.id}>
                      {p.name}
                    </Option>
                  ))}
                </Select>
                {fieldErrors.role_id && (
                  <span className="mt-1 block text-xs text-red-500">
                    This field is required
                  </span>
                )}
              </div>
              {/* Phone */}
              <div className="sm:col-span-3">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    const digits = e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 9);
                    setPhone(digits);

                    // solo error si hay algo y no es válido
                    setFieldErrors((prev) => ({
                      ...prev,
                      phone: digits.length > 0 && digits.length !== 9,
                    }));
                  }}
                  className={fieldErrors.phone ? 'border-red-500' : ''}
                />

                {fieldErrors.phone && phone.length > 0 && (
                  <span className="mt-1 block text-xs text-red-500">
                    The phone number must contain exactly 9 digits.
                  </span>
                )}
              </div>
            </div>
            {/* Botones */}
            <FormButtons
              isEditing={isEditing}
              editingId={editingId}
              onCancel={handleCancel}
              className="flex-col sm:flex-row"
            />
          </form>
        </Card>
        <Card>
          <CardHeader
            variant="gradient"
            color="gray"
            className="p-6 shadow-none"
          >
            <Typography variant="h4" color="white">
              Register Users
            </Typography>
          </CardHeader>
          <CardBody className="overflow-x-scroll p-8 pb-2 pt-0">
            <table className="w-full min-w-[600px] table-auto border text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Full Name</th>
                  <th className="border px-4 py-2">Email</th>
                  <th className="border px-4 py-2">Role</th>
                  <th className="border px-4 py-2">Status</th>
                  <th className="border px-4 py-2">Date of Entry</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-4 text-center">
                      No data available
                    </td>
                  </tr>
                ) : (
                  localUsers.map((row, idx) => (
                    <tr
                      key={row.id || idx}
                      className="transition-colors duration-200 hover:bg-blue-50"
                    >
                      <td className="border px-4 py-2">{row.fullname}</td>
                      <td className="border px-4 py-2">{row.email}</td>
                      <td className="border px-4 py-2">
                        {getRoleName(row.role_id)}
                      </td>
                      <td className="border px-4 py-2">{row.status}</td>
                      <td className="border px-4 py-2">
                        {row.created_at || ''}
                      </td>
                      <td className="border px-4 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => handleEdit(row)}
                            title="Edit"
                          >
                            <MdEdit size={20} />
                          </button>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDelete(row)}
                            title="Delete"
                          >
                            <MdDelete size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </ScaleWrapper>
  );
}

export default Users;
