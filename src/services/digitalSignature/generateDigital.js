import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image';

export const submitFormData = async (data) => {
  console.log('data--', data);
  const element = document.getElementById('digital_signature');

  if (!element) {
    console.error('element not found');
    return;
  }

  try {
    const canvas = await html2canvas(element, { useCORS: true });
    canvas.toDataURL('image/png');
    const finalImage = await domtoimage.toPng(element);

    const link = document.createElement('a');
    link.href = finalImage;
    link.download = `digitalSignature_${data.type}_${data.fullname}.png`;
    link.click();
  } catch (error) {
    console.error('Error function submitFormData', error);
  }
};
