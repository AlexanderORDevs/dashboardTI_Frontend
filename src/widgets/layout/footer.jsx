import { Typography } from '@material-tailwind/react';

export function Footer({}) {
  return (
    <footer className="mt-auto bg-white p-4 shadow">
      <div className="flex w-full flex-wrap items-center justify-center gap-6 px-2 md:justify-between">
        <Typography
          variant="small"
          color="white"
          className="font-normal text-inherit"
        >
          &copy; All Right Reserved 2026
        </Typography>
      </div>
    </footer>
  );
}

export default Footer;
