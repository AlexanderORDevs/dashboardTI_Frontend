import { Card, CardHeader, Typography } from '@material-tailwind/react';
import Label from '@/widgets/forms/label';
import Select from '@/widgets/forms/select';
import Option from '@/widgets/forms/option';
import Input from '@/widgets/forms/input';
import FormButtons from '@/components/apiSend/FormButtons';
import CustomSwal from '@/utils/customSwal';
import { useState, useEffect } from 'react';
import { getAllProducts } from '@/services/products/getProduct';
import { getAllState } from '@/services/state/getState';
import { postApiSend } from '@/services/apiSend/postApiSend';
import { getAllOwner } from '@/services/owner/getOwner';
import ScaleWrapper from '@/components/ScaleWrapper';

function getTodayMMDDYYYY() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function normalizePhone(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

export function ApiSends() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [type, setType] = useState('');
  const [gender, setGender] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [owners, setOwners] = useState([]);
  const [ownerInput, setOwnerInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [states, setStates] = useState([]);

  const [fieldErrors, setFieldErrors] = useState({});
  const [openStateModal, setOpenStateModal] = useState(false);

  const ownerNameToId = {};
  owners.forEach((o) => {
    ownerNameToId[o.name] = o.id;
  });

  useEffect(() => {
    async function loadData() {
      const prodData = await getAllProducts();
      setProducts(Array.isArray(prodData) ? prodData : []);

      const stateData = await getAllState();
      setStates(Array.isArray(stateData) ? stateData : []);

      const ownerData = await getAllOwner();
      setOwners(Array.isArray(ownerData) ? ownerData : []);
    }
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = {};

    if (!email) errors.email = true;
    if (!firstName) errors.firstName = true;
    if (!lastName) errors.lastName = true;
    if (!phone || phone.length !== 10) errors.phone = true;
    if (!state) errors.state = true;
    if (!type) errors.type = true;
    if (!gender) errors.gender = true;
    if (!ownerId) errors.owner = true;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    const payload = {
      firstName,
      lastName,
      email,
      phone,
      state,
      dateSubscribed: getTodayMMDDYYYY(),
      type,
      gender,
      ownerId,
    };
    try {
      setIsSubmitting(true);
      const result = await postApiSend(payload);

      if (
        result.statusMessage === 200 ||
        result.httpStatusCode === 200 ||
        result.httpStatusCode === 201
      ) {
        CustomSwal.fire({
          icon: 'success',
          title: 'API Sent!',
          text: 'Data posted successfully.',
        });
        handleCancel();
      } else {
        CustomSwal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'Unknown error',
        });
      }
    } catch (error) {
      CustomSwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Technical error while sending data.',
      });
      console.error('Error submitting:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setState('');
    setType('');
    setGender('');
    setOwnerId('');
    setOwnerInput('');
    setFieldErrors({});
  };

  return (
    <ScaleWrapper scale={0.6} buffer={40}>
      <div className="mb-8 mt-12 flex flex-col gap-12">
        <Card color="white" className="shadow-none">
          <CardHeader
            variant="gradient"
            style={{ backgroundColor: '#EEA11E' }}
            className="flex items-center justify-between p-6"
          >
            <Typography variant="h4" color="white">
              ADD A NEW LEAD
            </Typography>
          </CardHeader>
          <form className="space-y-10 rounded-xl p-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
              {/* First Name */}
              <div className="sm:col-span-3">
                <Label>First Name</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={fieldErrors.firstName ? 'border-red-500' : ''}
                />
                {fieldErrors.firstName && (
                  <span className="text-xs text-red-500">Required</span>
                )}
              </div>

              {/* Last Name */}
              <div className="sm:col-span-3">
                <Label>Last Name</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={fieldErrors.lastName ? 'border-red-500' : ''}
                />
                {fieldErrors.lastName && (
                  <span className="text-xs text-red-500">Required</span>
                )}
              </div>

              {/* Email */}
              <div className="sm:col-span-3">
                <Label>Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldErrors.email ? 'border-red-500' : ''}
                />
                {fieldErrors.email && (
                  <span className="text-xs text-red-500">Required</span>
                )}
              </div>

              {/* Phone */}
              <div className="sm:col-span-3">
                <Label>Phone Number</Label>

                <Input
                  value={phone}
                  onChange={(e) => {
                    const normalized = normalizePhone(e.target.value);
                    setPhone(normalized);
                  }}
                  placeholder="10-digit phone number"
                  inputMode="numeric"
                  className={fieldErrors.phone ? 'border-red-500' : ''}
                />

                {fieldErrors.phone && (
                  <span className="text-xs text-red-500">
                    Phone number must be exactly 10 digits
                  </span>
                )}
              </div>

              {/* State (Modal trigger) */}
              <div className="sm:col-span-3">
                <Label>State</Label>
                <button
                  type="button"
                  onClick={() => setOpenStateModal(true)}
                  className={`w-full rounded-lg border-2 border-black px-4 py-2 text-left ${fieldErrors.phone ? 'border-red-500' : ''}`}
                >
                  {state || 'Select State'}
                </button>
                {fieldErrors.state && (
                  <span className="text-xs text-red-500">Required</span>
                )}
              </div>

              {/* Type */}
              <div className="sm:col-span-3">
                <Label>Type</Label>
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={`${fieldErrors.type ? 'border-red-500' : ''}`}
                >
                  <Option value="" disabled hidden>
                    Select Type
                  </Option>
                  {products.map((p) => (
                    <Option key={p.id} value={p.name}>
                      {p.name}
                    </Option>
                  ))}
                </Select>
                {fieldErrors.type && (
                  <span className="text-xs text-red-500">Required</span>
                )}
              </div>

              {/* Gender */}
              <div className="sm:col-span-3">
                <Label>Gender</Label>
                <Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`${fieldErrors.gender ? 'border-red-500' : ''}`}
                >
                  <Option value="" disabled hidden>
                    Select Gender
                  </Option>
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                </Select>
                {fieldErrors.gender && (
                  <span className="text-xs text-red-500">Required</span>
                )}
              </div>

              {/* Supplier */}

              <div className="sm:col-span-3">
                <Label>Supplier</Label>

                <input
                  type="text"
                  list="supplier-list"
                  placeholder="Select Supplier"
                  value={ownerInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setOwnerInput(value);

                    const matchedOwner = owners.find(
                      (o) => o.name.toLowerCase() === value.toLowerCase()
                    );

                    setOwnerId(matchedOwner ? matchedOwner.id : '');
                  }}
                  className={`block w-full rounded-lg border-2 border-black px-4 py-2 text-lg font-medium focus:outline-none ${fieldErrors.owner ? 'border-red-500' : ''}`}
                />

                <datalist id="supplier-list">
                  {owners.map((o) => (
                    <option key={o.id} value={o.name} />
                  ))}
                </datalist>

                {fieldErrors.owner && (
                  <span className="text-xs text-red-500">Required</span>
                )}
              </div>
            </div>
            <FormButtons isLoading={isSubmitting} onCancel={handleCancel} />
          </form>
        </Card>
        {/* Modal State */}
        {openStateModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center "
            onClick={() => setOpenStateModal(false)}
          >
            <div
              className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Select State</h2>
                <button
                  type="button"
                  onClick={() => setOpenStateModal(false)}
                  className="text-2xl leading-none text-gray-500 hover:text-black"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {states
                  .filter((s) => s.name)
                  .map((s) => {
                    const selected = state === s.name;

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setState(s.name);
                          setOpenStateModal(false);
                        }}
                        className={`
                  flex items-center justify-center gap-3
                  rounded-lg border px-4 py-3
                  text-lg font-medium
                  transition
                  ${
                    selected
                      ? 'border-[#EEA11E] bg-[#FFF4E5]'
                      : 'border-gray-300 hover:bg-gray-100'
                  }
                `}
                      >
                        <span
                          className={`
                    h-4 w-4 rounded-full border-2
                    ${selected ? 'border-[#EEA11E] bg-[#EEA11E]' : 'border-gray-400'}
                  `}
                        />
                        <span>{s.name === 'NULL' ? 'No State' : s.name}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </ScaleWrapper>
  );
}

export default ApiSends;
