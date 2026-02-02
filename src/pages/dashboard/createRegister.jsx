import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from '@material-tailwind/react';
import CustomSwal from '@/utils/customSwal';
import { useState, useEffect, useRef } from 'react';
import Label from '@/widgets/forms/label';
import Select from '@/widgets/forms/select';
import Option from '@/widgets/forms/option';
import Input from '@/widgets/forms/input';
import ChecklistTable from '@/components/uat/ChecklistTable';
import UatFilters from '@/components/uat/UatFilters';
import LandingTable from '@/components/uat/LandingTable';
import DidTable from '@/components/uat/DidTable';
import FormButtons from '@/components/uat/FormButtons';
import { useUsers } from '@/context/allUsers';
import { saveRegister } from '@/services/uat/createUat';
import { getUatRecords } from '@/services/uat/getUat';
import { updatedRegister } from '@/services/uat/updateUat';
import { getAllProducts } from '@/services/products/getProduct';
import { getAllDomains } from '@/services/domain/getDomain';
import ScaleWrapper from '@/components/ScaleWrapper';

export function CreateRegister() {
  const { users } = useUsers();
  const formRef = useRef(null);
  const filterConfigs = {
    landing: [
      { key: 'filterUser', label: 'User', type: 'text' },
      { key: 'filterProduct', label: 'Product', type: 'select' },
      { key: 'filterDomain', label: 'Domain', type: 'select' },
      { key: 'filterTesterId', label: 'Tester', type: 'select' },
      { key: 'filterCreatedDate', label: 'Created Date', type: 'date' },
    ],
    did: [
      { key: 'filterContact', label: 'Contact', type: 'text' },
      { key: 'filterDid', label: 'DID', type: 'text' },
      { key: 'filterUser', label: 'User', type: 'text' },
      { key: 'filterTesterId', label: 'Tester', type: 'select' },
      { key: 'filterProduct', label: 'Product', type: 'select' },
      { key: 'filterCreatedDate', label: 'Created Date', type: 'date' },
    ],
  };

  const [selectedTable, setSelectedTable] = useState('');
  const [landingData, setLandingData] = useState([]);
  const [loadingLanding, setLoadingLanding] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [showSelector, setShowSelector] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  //Add status for form
  const [testType, setTestType] = useState('provider');
  const [testerId, setTesterId] = useState('');
  const [user, setUser] = useState('');
  const [idProduct, setIdProduct] = useState('');
  const [products, setProducts] = useState([]);
  const [uatType, setUatType] = useState('landing');
  const [urlLanding, setUrlLanding] = useState('');
  const [idDomain, setIdDomain] = useState('');
  const [domains, setDomains] = useState([]);
  const [contact, setContact] = useState('');
  const [did, setDid] = useState('');
  const [didDate, setDidDate] = useState('');
  const [mode, setMode] = useState('transfer');
  const [cpaCpl, setCpaCpl] = useState('transfer');
  const [status, setStatus] = useState('pending');
  const [nameRegister, setNameRegister] = useState('');
  const [observations, setObservations] = useState('');

  //Add status for search
  const [filterUser, setFilterUser] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterDomain, setFilterDomain] = useState('');
  const [filterTesterId, setFilterTesterId] = useState('');
  const [filterCreatedDate, setFilterCreatedDate] = useState('');
  const [filterContact, setFilterContact] = useState('');
  const [filterDid, setFilterDid] = useState('');

  // Toggle function for accordion visibility
  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };
  //Configuration for table
  const [landingRows, setLandingRows] = useState([
    {
      useCase: 'Carga de la página y Responsividad',
      criteria:
        'La página debe cargar en menos de 3 segundos sin errores en imágenes o videos, adaptarse bien a todos los dispositivos y tamaños de pantalla.',
      checked: null,
    },
    {
      useCase: 'Funcionalidad de formularios',
      criteria:
        'Todos los campos de los formularios deben funcionar correctamente. El formulario debe permitir la entrada de datos válidos, mostrar mensajes de error claros en caso de datos incorrectos y enviar la información exitosamente.',
      checked: null,
    },
    {
      useCase: 'CTA (Call to Action)',
      criteria:
        'Los botones de llamada a la acción deben ser visibles y funcionar adecuadamente, dirigiendo al usuario al envío exitoso. La acción esperada debe completarse sin fallos.',
      checked: null,
    },
    {
      useCase: 'Emite TCPA',
      criteria:
        'Verifica que el TCPA haya sido emitido correctamente en LeadConduit.',
      checked: null,
    },
  ]);
  const [didSelectRows, setDidSelectRows] = useState([
    {
      useCase: 'Tag con información de la campaña',
      criteria:
        'Verificar que tag del DID asignado muestre si es buffer (cantidad de segundos) o transfer y el nombre de la campaña. ',
      checked: null,
    },
    {
      useCase: 'Grabación de alerta ',
      criteria:
        'Verificar que la grabación asignada corresponda a la campaña, indicando el tipo de producto y tipo de llamada (Buffer - Transfer)',
      checked: null,
    },
    {
      useCase: 'Operatividad de DID',
      criteria:
        'Verifica que el DID asignado a la campaña/usuario esté operativo y garantizar su conectividad adecuada.',
      checked: null,
    },
    {
      useCase: 'Desborde a Call Center externo',
      criteria:
        'Verifica que el desborde de esta campaña/usuario con Call Center externo esté operativo y garantiza su conectividad adecuada.',
      checked: null,
    },
    {
      useCase: 'Tiempo límite para Drop',
      criteria:
        'Verifica que el tiempo de drop para la campaña esté configurado con un máximo de 10 segundos.',
      checked: null,
    },
    {
      useCase: 'Validar filtro de llamadas entrantes a grupos telefónicos',
      criteria:
        'Confirmar que las llamadas entrantes se filtran y dirigen al grupo correcto según los parámetros.',
      checked: null,
    },
    {
      useCase: 'Registro en Salesforce bajo el case owner correspondiente',
      criteria:
        'Confirmar que las casos en Salesforce pueden ser registros sin problema bajo el contacto correspondiente. ',
      checked: null,
    },
  ]);

  //FUNCTIONS
  const fetchUatRecords = async (tableType, filters = {}) => {
    setLoadingLanding(true);
    try {
      const data = await getUatRecords(tableType, filters);
      setLandingData(data);
    } catch (error) {
      setLandingData([]);
      console.error('Error fetching UAT:', error);
    } finally {
      setLoadingLanding(false);
    }
  };

  const getTesterName = (testerId) => {
    if (!Array.isArray(users)) return '';
    const tester = users.find((u) => String(u.id) === String(testerId));
    return tester ? tester.username : testerId || '';
  };
  function formatDateToDMY(dateStr) {
    const [year, month, day] = dateStr?.split('-') || [];
    return year && month && day ? `${day}/${month}/${year}` : '';
  }

  function convertDMYtoYMD(dateStr) {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('-');
    if (day && month && year) return `${year}-${month}-${day}`;
    return '';
  }

  const getProductName = (id) => {
    const prod = products.find((p) => String(p.id) === String(id));
    return prod ? prod.name : '';
  };

  function getDomainName(id) {
    const domain = domains.find((d) => String(d.id) === String(id));
    return domain ? domain.name : id || '';
  }

  function renderMainFormFields() {
    return (
      <>
        {/* Test Type selector */}
        <div className="sm:col-span-3">
          <Label htmlFor="test_type">Test Type</Label>
          <Select
            id="test_type"
            name="testType"
            value={testType}
            onChange={(e) => setTestType(e.target.value)}
          >
            <Option value="provider">Provider</Option>
            <Option value="client">Client</Option>
          </Select>
        </div>
        {/* Tester Name */}
        <div className="sm:col-span-3">
          <Label htmlFor="test_name">Tester Name</Label>
          <Select
            id="testerId"
            name="testerId"
            value={testerId}
            onChange={(e) => {
              setTesterId(e.target.value);
              setFieldErrors((prev) => ({ ...prev, testerId: false }));
            }}
            className={fieldErrors.testerId ? 'border-red-500' : ''}
          >
            <Option value="" disabled hidden>
              Select Tester
            </Option>
            {Array.isArray(users) &&
              users.map((u) => (
                <Option key={u.id} value={u.id}>
                  {u.username}
                </Option>
              ))}
          </Select>
          {fieldErrors.testerId && (
            <span className="mt-1 block text-xs text-red-500">
              This field is required
            </span>
          )}
        </div>
        {/* User */}
        <div className="sm:col-span-3">
          <Label htmlFor="user_name">User</Label>
          <Input
            id="user"
            name="user_name"
            type="text"
            placeholder="Enter user name"
            value={user}
            onChange={(e) => {
              setUser(e.target.value);
              setFieldErrors((prev) => ({ ...prev, user: false }));
            }}
            className={fieldErrors.user ? 'border-red-500' : ''}
          />
          {fieldErrors.user && (
            <span className="mt-1 block text-xs text-red-500">
              This field is required
            </span>
          )}
        </div>
        {/* Product */}
        <div className="sm:col-span-3">
          <Label htmlFor="product_name">Product</Label>
          <Select
            id="product"
            name="idProduct"
            value={idProduct}
            onChange={(e) => {
              setIdProduct(e.target.value);
              setFieldErrors((prev) => ({ ...prev, idProduct: false }));
            }}
            className={fieldErrors.idProduct ? 'border-red-500' : ''}
          >
            <Option value="" disabled hidden>
              Select Product
            </Option>
            {products.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.name}
              </Option>
            ))}
          </Select>
          {fieldErrors.idProduct && (
            <span className="mt-1 block text-xs text-red-500">
              This field is required
            </span>
          )}
        </div>
        {/* uat Type selector */}
        <div className="sm:col-span-3">
          <Label htmlFor="uat_type">UAT Type</Label>
          <Select
            id="uat_type"
            name="uatType"
            value={uatType}
            onChange={(e) => setUatType(e.target.value)}
            disabled={isEditing}
          >
            <Option value="landing">Landing</Option>
            <Option value="did_select">DID</Option>
          </Select>
        </div>
      </>
    );
  }

  function renderLandingFields() {
    return (
      <>
        <div className="sm:col-span-3">
          <Label htmlFor="url_landing">Landing URL</Label>
          <Input
            id="url_landing"
            name="url_landing"
            type="text"
            placeholder="Enter url landing"
            value={urlLanding}
            onChange={(e) => {
              setUrlLanding(e.target.value);
              setFieldErrors((prev) => ({ ...prev, urlLanding: false }));
            }}
            className={fieldErrors.urlLanding ? 'border-red-500' : ''}
          />
          {fieldErrors.urlLanding && (
            <span className="mt-1 block text-xs text-red-500">
              This field is required
            </span>
          )}
        </div>

        {/* Domain Name */}
        <div className="sm:col-span-3">
          <Label htmlFor="domaninName">Domain Name</Label>
          <Select
            id="domainName"
            name="idDomain"
            value={idDomain}
            onChange={(e) => {
              setIdDomain(e.target.value);
              setFieldErrors((prev) => ({ ...prev, idDomain: false }));
            }}
            className={fieldErrors.idDomain ? 'border-red-500' : ''}
          >
            <Option value="" disabled hidden>
              Select Domain
            </Option>
            {domains.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.name}
              </Option>
            ))}
          </Select>
          {fieldErrors.idDomain && (
            <span className="mt-1 block text-xs text-red-500">
              This field is required
            </span>
          )}
        </div>
      </>
    );
  }

  function renderDidFields() {
    return (
      <>
        {/* CONTACT */}
        <div className="sm:col-span-3">
          <Label htmlFor="contact">Contact</Label>
          <Input
            id="contact"
            name="contact"
            type="text"
            placeholder="Contact"
            value={contact}
            onChange={(e) => {
              setContact(e.target.value);
              setFieldErrors((prev) => ({ ...prev, contact: false }));
            }}
            className={fieldErrors.contact ? 'border-red-500' : ''}
          />
          {fieldErrors.contact && (
            <span className="mt-1 block text-xs text-red-500">
              This field is required
            </span>
          )}
        </div>

        {/* DID */}
        <div className="sm:col-span-3">
          <Label htmlFor="did">DID</Label>
          <Input
            id="did"
            name="did"
            type="text"
            placeholder="Enter DID"
            value={did}
            onChange={(e) => {
              setDid(e.target.value);
              setFieldErrors((prev) => ({ ...prev, did: false }));
            }}
            className={fieldErrors.did ? 'border-red-500' : ''}
          />
          {fieldErrors.did && (
            <span className="mt-1 block text-xs text-red-500">
              This field is required
            </span>
          )}
        </div>

        {/* START DATE DID */}
        <div className="sm:col-span-3">
          <Label htmlFor="did_date">Date</Label>
          <div className="relative">
            <Input
              id="did_date"
              name="did_date"
              type="date"
              value={didDate}
              onChange={(e) => {
                setDidDate(e.target.value);
                setFieldErrors((prev) => ({ ...prev, didDate: false }));
              }}
              className={`${fieldErrors.didDate ? 'border-red-500' : ''} pr-10`}
              style={{ colorScheme: 'light' }}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"></span>
            {fieldErrors.didDate && (
              <span className="mt-1 block text-xs text-red-500">
                This field is required
              </span>
            )}
          </div>
        </div>

        {/* Mode */}
        <div className="sm:col-span-3">
          <Label htmlFor="uat_type">Mode</Label>
          <Select
            id="mode"
            name="mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <Option value="transfer">Transfer</Option>
            <Option value="buffer">Buffer</Option>
          </Select>
        </div>

        {/* CPA/CPL */}
        <div className="sm:col-span-3">
          <Label htmlFor="cpa_cpl">CPA/CPL</Label>
          <Select
            id="cpa_cpl"
            name="cpa_cpl"
            value={cpaCpl}
            onChange={(e) => setCpaCpl(e.target.value)}
          >
            <Option value="transfer">Transfer</Option>
            <Option value="buffer_180">CPL (Buffer 180s)</Option>
            <Option value="buffer_120">CPL (Buffer 120s)</Option>
          </Select>
        </div>

        {/* Campos fijos */}
        <div className="sm:col-span-9">
          <div className="border-b-2 border-indigo-500 py-4">
            <button
              type="button"
              onClick={toggleAccordion}
              className="text-lg font-semibold text-indigo-700"
            >
              {isOpen
                ? 'Hide Additional Information'
                : 'Show Additional Information'}
            </button>
          </div>
          {isOpen && (
            <div className="mt-4 space-y-6 rounded-lg bg-indigo-50 p-4">
              {/* Use grid for 3 columns */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* External Call */}
                <div>
                  <Label htmlFor="externalCall">
                    External Call Center DID/CPL
                  </Label>
                  <Input
                    id="externalCall"
                    name="externalCall"
                    type="text"
                    disabled
                    value="InGroup"
                  />
                </div>

                {/* Schedule */}
                <div>
                  <Label htmlFor="schedule">Schedule</Label>
                  <Input
                    id="schedule"
                    name="schedule"
                    type="text"
                    disabled
                    value="9am - 7pm EST"
                  />
                </div>

                {/* Filter phone group inbound */}
                <div>
                  <Label htmlFor="filterPhone">
                    Filter phone group inbound
                  </Label>
                  <Input
                    id="filterPhone"
                    name="filterPhone"
                    type="text"
                    disabled
                    value="Yes"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  function renderRecordSelector() {
    return (
      <div
        className="relative flex items-center justify-center bg-indigo-50 py-6"
        style={{ minHeight: 56, cursor: 'pointer' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={hasSelected ? () => setShowSelector(false) : undefined}
      >
        <div
          className={`
          transition-all duration-500
          ${showSelector ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}
          flex flex-row items-center gap-6
        `}
        >
          <Label className="whitespace-nowrap text-base font-semibold text-indigo-800">
            Which records would you like to load?
          </Label>
          <Select
            value={selectedTable}
            onChange={handleSelectChange}
            className="w-48 rounded-lg border-2 border-indigo-400 bg-white px-3 py-2 text-base font-bold shadow"
          >
            <Option value="" disabled hidden>
              Select an option
            </Option>
            <Option value="landing">Landings</Option>
            <Option value="did">Did</Option>
          </Select>
        </div>
      </div>
    );
  }

  const filterSetters = {
    filterUser: setFilterUser,
    filterProduct: setFilterProduct,
    filterDomain: setFilterDomain,
    filterTesterId: setFilterTesterId,
    filterCreatedDate: setFilterCreatedDate,
    filterContact: setFilterContact,
    filterDid: setFilterDid,
  };

  const filterValues = {
    filterUser,
    filterProduct,
    filterDomain,
    filterTesterId,
    filterCreatedDate,
    filterContact,
    filterDid,
  };

  const filterMap = {
    landing: [
      { key: 'filterUser', field: 'user' },
      { key: 'filterProduct', field: 'idProduct' },
      { key: 'filterDomain', field: 'idDomain' },
      { key: 'filterTesterId', field: 'testerId' },
      { key: 'filterCreatedDate', field: 'filterCreatedDate', format: true },
    ],
    did: [
      { key: 'filterContact', field: 'contact' },
      { key: 'filterDid', field: 'did' },
      { key: 'filterUser', field: 'user' },
      { key: 'filterTesterId', field: 'testerId' },
      { key: 'filterProduct', field: 'idProduct' },
      { key: 'filterCreatedDate', field: 'filterCreatedDate', format: true },
    ],
  };

  const hasActiveFilters =
    filterUser ||
    filterProduct ||
    filterDomain ||
    filterTesterId ||
    filterCreatedDate ||
    filterContact ||
    filterDid;

  //SEARCH
  const handleSearch = () => {
    const filters = {};
    const config = filterMap[selectedTable] || [];
    config.forEach(({ key, field, format }) => {
      const value = filterValues[key];
      if (value) {
        filters[field] = format ? formatDateToDMY(value) : value;
      }
    });
    fetchUatRecords(selectedTable, filters);
  };

  const clearFilters = () => {
    setFilterUser('');
    setFilterProduct('');
    setFilterDomain('');
    setFilterTesterId('');
    setFilterCreatedDate('');
    setFilterContact('');
    setFilterDid('');
    fetchUatRecords(selectedTable, {});
  };

  const handleEditLanding = (row) => {
    setEditId(row.id);
    setTestType(row.testType || 'provider');
    setTesterId(String(row.testerId || ''));
    setUser(row.user || '');
    setIdProduct(row.idProduct || '');
    setUatType('landing');
    setUrlLanding(row.urlLanding || '');
    setIdDomain(String(row.idDomain || ''));
    setStatus(row.status || 'pending');
    setNameRegister(row.nameRegister || '');
    setObservations(row.observations || '');
    if (row.checklist) setLandingRows(row.checklist);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    setIsEditing(true);
  };

  const handleEditDid = (row) => {
    setEditId(row.id);
    setTestType(row.testType || 'provider');
    setTesterId(String(row.testerId || ''));
    setUser(row.user || '');
    setIdProduct(row.idProduct || '');
    setUatType('did_select');
    setContact(row.contact || '');
    setDid(row.did || '');
    setDidDate(convertDMYtoYMD(row.didDate || ''));
    setMode(row.mode || 'transfer');
    setCpaCpl(row.cpaCpl || 'transfer');
    setStatus(row.status || 'pending');
    setNameRegister(row.nameRegister || '');
    setObservations(row.observations || '');
    if (row.checklist) setDidSelectRows(row.checklist);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    setIsEditing(true);
  };
  // Hide the selector with a transition when an option is selected
  const handleSelectChange = (e) => {
    setSelectedTable(e.target.value);
    setShowSelector(false);
    setHasSelected(true); // Marcar que ya se eligió
  };

  // Function to handle status change for each row (true for correct, false for incorrect)
  const handleStatusChange = (rowIndex, newStatus) => {
    if (uatType === 'landing') {
      const updatedRows = [...landingRows];
      updatedRows[rowIndex].status = newStatus;
      setLandingRows(updatedRows);
    } else {
      const updatedRows = [...didSelectRows];
      updatedRows[rowIndex].status = newStatus;
      setDidSelectRows(updatedRows);
    }
  };

  // Show the selector when hovering over the area
  const handleMouseEnter = () => {
    setShowSelector(true);
  };

  useEffect(() => {
    async function fetchDomains() {
      try {
        const data = await getAllDomains();
        setDomains(Array.isArray(data) ? data : []);
      } catch (error) {
        setDomains([]);
        console.error('Error fetching domains:', error);
      }
    }
    async function fetchProducts() {
      try {
        const data = await getAllProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        setProducts([]);
        console.error('Error fetching products:', error);
      }
    }
    fetchDomains();
    fetchProducts();
  }, []);

  // Effect that updates the Name Register field when changing UAT Type or CPA/CPL
  useEffect(() => {
    if (selectedTable) {
      fetchUatRecords(selectedTable);
    }
    let registerValue = '';
    const productName = getProductName(idProduct).replace(/\s+/g, '');
    const userName = user.replace(/\s+/g, '');
    if (uatType === 'landing') {
      registerValue = `${productName}_${userName}`;
    } else if (uatType === 'did_select') {
      // Constructs the value for did_select
      let cpaValue = '';
      if (cpaCpl === 'transfer') {
        cpaValue = 'Xfer';
      } else if (cpaCpl === 'buffer_180') {
        cpaValue = '170';
      } else if (cpaCpl === 'buffer_120') {
        cpaValue = '110';
      }
      registerValue = `${productName}_${cpaValue}_${userName}`;
    }
    setNameRegister(registerValue);
  }, [uatType, selectedTable, cpaCpl, idProduct, user]);

  // Handler for submit
  const handleCancel = () => {
    setTestType('provider');
    setTesterId('');
    setUser('');
    setIdProduct('');
    setUatType('landing');
    setUrlLanding('');
    setIdDomain('');
    setContact('');
    setDid('');
    setDidDate('');
    setMode('transfer');
    setCpaCpl('transfer');
    setStatus('pending');
    setNameRegister('');
    setObservations('');
    setLandingRows([
      {
        useCase: 'Carga de la página y Responsividad',
        criteria:
          'La página debe cargar en menos de 3 segundos sin errores en imágenes o videos, adaptarse bien a todos los dispositivos y tamaños de pantalla.',
        checked: null,
      },
      {
        useCase: 'Funcionalidad de formularios',
        criteria:
          'Todos los campos de los formularios deben funcionar correctamente. El formulario debe permitir la entrada de datos válidos, mostrar mensajes de error claros en caso de datos incorrectos y enviar la información exitosamente.',
        checked: null,
      },
      {
        useCase: 'CTA (Call to Action)',
        criteria:
          'Los botones de llamada a la acción deben ser visibles y funcionar adecuadamente, dirigiendo al usuario al envío exitoso. La acción esperada debe completarse sin fallos.',
        checked: null,
      },
      {
        useCase: 'Emite TCPA',
        criteria:
          'Verifica que el TCPA haya sido emitido correctamente en LeadConduit.',
        checked: null,
      },
    ]);
    setDidSelectRows([
      {
        useCase: 'Tag con información de la campaña',
        criteria:
          'Verificar que tag del DID asignado muestre si es buffer (cantidad de segundos) o transfer y el nombre de la campaña. ',
        checked: null,
      },
      {
        useCase: 'Grabación de alerta ',
        criteria:
          'Verificar que la grabación asignada corresponda a la campaña, indicando el tipo de producto y tipo de llamada (Buffer - Transfer)',
        checked: null,
      },
      {
        useCase: 'Operatividad de DID',
        criteria:
          'Verifica que el DID asignado a la campaña/usuario esté operativo y garantizar su conectividad adecuada.',
        checked: null,
      },
      {
        useCase: 'Desborde a Call Center externo',
        criteria:
          'Verifica que el desborde de esta campaña/usuario con Call Center externo esté operativo y garantiza su conectividad adecuada.',
        checked: null,
      },
      {
        useCase: 'Tiempo límite para Drop',
        criteria:
          'Verifica que el tiempo de drop para la campaña esté configurado con un máximo de 10 segundos.',
        checked: null,
      },
      {
        useCase: 'Validar filtro de llamadas entrantes a grupos telefónicos',
        criteria:
          'Confirmar que las llamadas entrantes se filtran y dirigen al grupo correcto según los parámetros.',
        checked: null,
      },
      {
        useCase: 'Registro en Salesforce bajo el case owner correspondiente',
        criteria:
          'Confirmar que las casos en Salesforce pueden ser registros sin problema bajo el contacto correspondiente. ',
        checked: null,
      },
    ]);
    setEditId(null);
    setIsEditing(false);
  };

  // Handler for submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = {};

    // General
    if (!testerId.toString().trim()) errors.testerId = true;
    if (!user.trim()) errors.user = true;
    if (!String(idProduct).trim()) errors.idProduct = true;

    // Landing
    if (uatType === 'landing') {
      if (!urlLanding.trim()) errors.urlLanding = true;
      if (!String(idDomain).trim()) errors.idDomain = true;
    }

    // DID
    if (uatType === 'did_select') {
      if (!did.trim()) errors.did = true;
      if (!mode.trim()) errors.mode = true;
      if (!cpaCpl.trim()) errors.cpaCpl = true;
      if (!contact.trim()) errors.contact = true;
      if (!didDate.trim()) errors.didDate = true;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      CustomSwal.fire({
        icon: 'error',
        title: 'Required Fields',
        text: 'Please fill in all required fields.',
      });
      return;
    }

    const formData = {
      testType,
      testerId,
      user,
      idProduct,
      uatType,
      status,
      observations,
      nameRegister,
      checklist: uatType === 'landing' ? landingRows : didSelectRows,
    };

    if (uatType === 'landing') {
      formData.urlLanding = urlLanding;
      formData.idDomain = idDomain;
    }

    if (uatType === 'did_select') {
      formData.contact = contact;
      formData.did = did;
      formData.didDate = didDate;
      formData.mode = mode;
      formData.cpaCpl = cpaCpl;
      formData.externalCall = 'InGroup';
      formData.schedule = '9am - 7pm EST';
      formData.filterPhone = 'Yes';
    }
    if (isEditing && editId) {
      formData.id = editId;
    }

    try {
      if (isEditing) {
        await updatedRegister(formData);
        CustomSwal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Data updated successfully',
        });
      } else {
        await saveRegister(formData);
        CustomSwal.fire({
          icon: 'success',
          title: 'Sent!',
          text: 'Data saved successfully',
        });
      }

      if (selectedTable) {
        fetchUatRecords(selectedTable);
      }

      // Reset form
      handleCancel();
    } catch (error) {
      CustomSwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error while saving the data',
      });

      console.error('Error formData', error);
    }
  };

  return (
    <ScaleWrapper scale={0.6} buffer={40}>
      <div className="mb-8 mt-12 flex flex-col gap-12">
        <Card color="white">
          <CardHeader
            variant="gradient"
            color="gray"
            className="p-6 shadow-none"
          >
            <Typography variant="h4" color="white">
              Create Register
            </Typography>
          </CardHeader>
          <form
            ref={formRef}
            className="space-y-10 rounded-xl p-8"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 text-xs sm:grid-cols-9 sm:text-[10px]">
              {renderMainFormFields()}

              {/* FIELDS LANDING */}
              {uatType === 'landing' && renderLandingFields()}

              {/* FIELDS DID */}
              {uatType === 'did_select' && renderDidFields()}
            </div>
            {/* Checklist Table */}
            <div className="rounded-lg border-4 border-indigo-400 bg-white p-2 shadow-lg sm:p-6">
              <h3 className="mb-3 block font-sans text-[20px] font-semibold leading-relaxed tracking-normal text-blue-gray-900">
                Checklist
              </h3>
              <ChecklistTable
                rows={uatType === 'landing' ? landingRows : didSelectRows}
                handleStatusChange={handleStatusChange}
              />
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-6">
              {/* Status */}
              <div className="sm:col-span-3">
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <Option value="passed">Passed</Option>
                  <Option value="failed">Failed</Option>
                  <Option value="pending">Pending</Option>
                </Select>
              </div>

              {/* Name Register */}
              <div className="sm:col-span-3">
                <Label htmlFor="name_register">Name Register</Label>
                <Input
                  id="name_register"
                  name="name_register"
                  type="text"
                  value={nameRegister}
                  onChange={(e) => setNameRegister(e.target.value)}
                />
              </div>
            </div>
            {/* Observations */}
            <div className="sm:col-span-6">
              <Label htmlFor="observations">Observations</Label>
              <textarea
                id="observations"
                name="observations"
                rows={3}
                placeholder="Write any observations here..."
                className="block w-full rounded-lg border-2 border-black px-4 py-2 text-lg font-medium transition-shadow focus:shadow-[0_0_0_3px_rgba(156,163,175,0.5)]"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>
            {/* Buttons */}
            <FormButtons
              isEditing={isEditing}
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
              UAT Records
            </Typography>
          </CardHeader>

          {/* Record Selector */}
          {renderRecordSelector()}

          {/* Search */}
          {selectedTable && (
            <UatFilters
              filterConfigs={filterConfigs}
              selectedTable={selectedTable}
              filterValues={filterValues}
              filterSetters={filterSetters}
              products={products}
              domains={domains}
              users={users}
              handleSearch={handleSearch}
              clearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          )}

          {/* Table Landing*/}
          {selectedTable === 'landing' && (
            <CardBody className="overflow-x-scroll p-8 pb-2 pt-0">
              {loadingLanding ? (
                <div className="py-8 text-center">Loading data...</div>
              ) : (
                <LandingTable
                  data={landingData}
                  onEdit={handleEditLanding}
                  getProductName={getProductName}
                  getDomainName={getDomainName}
                  getTesterName={getTesterName}
                />
              )}
            </CardBody>
          )}

          {/* Table Did*/}
          {selectedTable === 'did' && (
            <CardBody className="overflow-x-scroll p-8 pb-2 pt-0">
              {loadingLanding ? (
                <div className="py-8 text-center">Loading data...</div>
              ) : (
                <DidTable
                  data={landingData}
                  onEdit={handleEditDid}
                  getProductName={getProductName}
                  getTesterName={getTesterName}
                />
              )}
            </CardBody>
          )}
        </Card>
      </div>
    </ScaleWrapper>
  );
}

export default CreateRegister;
