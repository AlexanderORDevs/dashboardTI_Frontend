import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from '@material-tailwind/react';
import Label from '@/widgets/forms/label';
import Select from '@/widgets/forms/select';
import Option from '@/widgets/forms/option';
import Input from '@/widgets/forms/input';
import FormButtons from '@/components/uat/FormButtons';
import { useState } from 'react';
import ScaleWrapper from '@/components/ScaleWrapper';

export function LandingTemplates() {
  // Ejemplo de estados para campos del formulario
  const [templateName, setTemplateName] = useState('');
  const [domain, setDomain] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('active');

  // Handler para el submit
  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí tu lógica para guardar el template
  };

  // Handler para cancelar
  const handleCancel = () => {
    setTemplateName('');
    setDomain('');
    setUrl('');
    setStatus('active');
  };

  return (
    <ScaleWrapper scale={0.6} buffer={40}>
      <div className="mb-8 mt-12 flex flex-col gap-12">
        <Card color="white">
          <CardHeader
            variant="gradient"
            style={{ backgroundColor: '#EEA11E' }}
            className="p-6 shadow-none"
          >
            <Typography variant="h4" color="white">
              NAMING STANDARD
            </Typography>
          </CardHeader>
          <form className="space-y-10 rounded-xl p-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 text-xs sm:grid-cols-6 sm:text-[10px]">
              {/* Template Name */}
              <div className="sm:col-span-3">
                <Label htmlFor="template_name">Template Name</Label>
                <Input
                  id="template_name"
                  name="template_name"
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              {/* Domain */}
              <div className="sm:col-span-3">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  name="domain"
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
              {/* URL */}
              <div className="sm:col-span-3">
                <Label htmlFor="url">Landing URL</Label>
                <Input
                  id="url"
                  name="url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              {/* Status */}
              <div className="sm:col-span-3">
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </div>
            </div>
            {/* Botones */}
            <FormButtons
              isEditing={false}
              onCancel={handleCancel}
              className="flex-col sm:flex-row"
            />
          </form>
        </Card>
      </div>
    </ScaleWrapper>
  );
}

export default LandingTemplates;
