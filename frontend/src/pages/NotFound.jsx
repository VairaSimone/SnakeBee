import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <ExclamationTriangleIcon className="h-20 w-20 text-red-500 animate-bounce" />
      
      <h1 className="mt-6 text-6xl font-extrabold text-gray-900">
        {t("notFound.title")}
      </h1>
      <p className="mt-2 text-lg text-gray-600">
        {t("notFound.message")}
      </p>

      <Link
        to="/home"
        className="mt-6 inline-block rounded-lg bg-green-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-green-700 transition duration-200"
      >
        {t("notFound.backHome")}
      </Link>
    </div>
  );
};

export default NotFound;
