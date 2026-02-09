import { useState } from 'react';
import {
  Input,
  PreviewIMG,
  PreviewCaseReady,
  PreviewLAP,
  PreviewLHA,
} from '@/components/signature';
import { validateForm } from '../../hooks/validateDigital';
import { submitFormData } from '../../services/digitalSignature/generateDigital';
import ScaleWrapper from '@/components/ScaleWrapper';

const companyDesigns = {
  IMG: {
    phone: '(01) 716-2405',
    email: 'email@img360.com',
    type: 'IMG',
  },
  CASEREADY: {
    phone: '(01) 716-2405',
    email: 'email@casereadyintake.com',
    type: 'CASEREADY',
  },
  LHA: {
    phone: '1-800-680-4770 | ext 0006',
    email: 'email@legalhelpadvisor.com',
    type: 'LHA',
  },
  LAP: {
    phone: '1-800-230-4578 / ext 0006',
    email: 'email@legalactionpartner.com',
    type: 'LAP',
  },
};

const formStructure = [
  {
    id: 'fullname',
    name: 'fullname',
    type: 'text',
    placeholder: 'Full Name',
    validate: ['fullName', 'isNotEmpty'],
    errorFormName: 'Full Name',
  },
  {
    id: 'position',
    name: 'position',
    type: 'text',
    placeholder: 'Position',
    validate: ['position', 'isNotEmpty'],
    errorFormName: 'Position',
  },
  {
    id: 'email',
    name: 'email',
    type: 'email',
    placeholder: 'Email',
    validate: ['isNotEmpty', 'isEmail'],
    errorFormName: 'Email',
  },
  {
    id: 'phoneNumber',
    name: 'phoneNumber',
    type: 'tel',
    placeholder: 'Phone Number',
    validate: ['isNotEmpty'],
    errorFormName: 'Phone Number',
  },
];

const generateAutoEmail = (fullname, selectedCompany) => {
  const normalized = fullname
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/gi, 'n')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.');

  const domain = companyDesigns[selectedCompany].email.split('@')[1];

  return `${normalized}@${domain}`;
};

export function DigitalSignature() {
  const [selectedCompany, setSelectedCompany] = useState('IMG');
  const [formValues, setFormValues] = useState({
    fullname: '',
    position: '',
    phoneNumber: companyDesigns.IMG.phone,
    email: companyDesigns.IMG.email,
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'fullname') {
      const autoEmail = generateAutoEmail(value, selectedCompany);

      const isEmailAuto =
        formValues.email ===
          generateAutoEmail(formValues.fullname, selectedCompany) ||
        formValues.email === companyDesigns[selectedCompany].email;

      setFormValues((prev) => ({
        ...prev,
        fullname: value,
        email: isEmailAuto ? autoEmail : prev.email,
      }));

      return;
    }

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCompanyChange = (event) => {
    const newCompany = event.target.value;
    setSelectedCompany(newCompany);

    setFormValues((prev) => ({
      ...prev,
      phoneNumber:
        prev.phoneNumber === companyDesigns[selectedCompany].phone
          ? companyDesigns[newCompany].phone
          : prev.phoneNumber,
      email:
        prev.email === companyDesigns[selectedCompany].email
          ? companyDesigns[newCompany].email
          : prev.email,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = formStructure.reduce(
      (acc, { name, validate, errorFormName }) => {
        const { isPass, message } = validateForm(
          formValues[name],
          validate,
          errorFormName
        );
        if (!isPass) acc[name] = message;
        return acc;
      },
      {}
    );

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    try {
      await submitFormData({
        ...formValues,
        type: companyDesigns[selectedCompany].type,
      });

      setFormValues((prev) => ({
        fullname: '',
        position: '',
        phoneNumber: prev.phoneNumber,
        email: companyDesigns[selectedCompany].email,
      }));
      setFormErrors({});
    } catch (error) {
      console.error('Critical Error', error);
    }
  };

  const previewProps = {
    fullname: formValues.fullname || 'Full Name',
    position: formValues.position || 'Position',
    phoneNumber: formValues.phoneNumber,
    email: formValues.email,
  };

  const PreviewComponent = {
    IMG: PreviewIMG,
    CASEREADY: PreviewCaseReady,
    LHA: PreviewLHA,
    LAP: PreviewLAP,
  }[selectedCompany];

  return (
    <div className="font-poppins bg-primary-red-500 bg-intro-mobile lg:bg-intro-desktop bg-desktop-intro flex min-h-screen flex-col items-center overflow-hidden p-6 lg:min-h-screen ">
      <div className=" py-20 lg:flex ">
        <div className="container flex flex-grow">
          <div className=" flex h-full flex-wrap">
            <div className="flex h-full w-full flex-col items-center justify-center px-3 py-20 lg:w-1/2 lg:py-0">
              <div className="my-auto space-y-8 text-white xl:w-10/12">
                <h1 className="text-center text-4xl font-bold lg:text-left lg:text-5xl">
                  Generate digital signature
                </h1>
                <p>
                  Complete the form with your information and generate a
                  personalized signature ready to download.
                </p>
              </div>
            </div>
            <div className="flex w-full items-center px-3 lg:w-1/2">
              <div className="w-full space-y-8">
                <h2 className="bg-accent-blue-500 shadow-hard-gray relative z-30 rounded-lg py-4 text-center text-white">
                  <span className="relative z-30 font-semibold">
                    Transform Your Data
                  </span>
                  <span className="relative z-30 ml-1 font-thin">
                    into a Digital Signature
                  </span>
                </h2>
                {/* Select Company */}
                <div className="flex flex-col">
                  <label className="mb-2 block font-semibold text-white">
                    Select Company:
                  </label>
                  <select
                    className="rounded-lg p-1 pl-9"
                    value={selectedCompany}
                    onChange={handleCompanyChange}
                  >
                    {Object.keys(companyDesigns).map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>

                <form
                  className="shadow-hard-gray rounded-lg bg-white"
                  onSubmit={handleSubmit}
                >
                  <div className="space-y-6 p-8 text-sm">
                    {formStructure.map((field) => (
                      <Input
                        key={field.id}
                        {...field}
                        error={formErrors[field.name] || ''}
                        value={formValues[field.name]}
                        onChange={handleChange}
                      />
                    ))}
                    <input
                      type="submit"
                      value="Download digital signature"
                      className="bg-primary-green-500 hover:bg-primary-green-600 active:bg-primary-green-700 border-primary-green-600 w-full cursor-pointer rounded-lg border-b-[6px] py-4 text-center font-semibold uppercase text-white"
                    />
                    <p className="text-neutral-grayish-blue-500 text-center text-[12px]">
                      Privacy policy and consumer protection |
                      <a
                        className="text-primary-red-500 ml-1 font-semibold"
                        href="/"
                        onClick={(e) => e.preventDefault()}
                      >
                        Terms and Services
                      </a>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h1 className="mb-10 self-start text-4xl font-bold text-white lg:text-5xl">
          PREVIEW
        </h1>
      </div>

      {/* <ScaleWrapper scale={0.6} buffer={40}> */}
      <div className="relative w-full overflow-hidden">
        <div className="mx-auto flex justify-center">
          <div>
            <PreviewComponent {...previewProps} />
          </div>
        </div>
      </div>
      {/* </ScaleWrapper> */}
    </div>
  );
}
