import { ChevronUp, ChevronDown } from "lucide-react";
import { useGeoData } from "../../contexts/GeoDataProvider";
import { useState, useEffect } from "react";

function Information() {
  const { metadata: rawMetadata } = useGeoData();
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    if (rawMetadata) {
      const cleanMetadata = removeUnwantedFields(rawMetadata);
      setMetadata(cleanMetadata);
    }
  }, [rawMetadata]);

  const removeUnwantedFields = (data: any): any => {
    if (Array.isArray(data)) {
      return data.map((item) => removeUnwantedFields(item));
    } else if (typeof data === "object" && data !== null) {
      const cleaned = { ...data };

      // Handle bands specifically
      if (cleaned.bands) {
        Object.keys(cleaned.bands).forEach((band) => {
          const bandData = cleaned.bands[band];
          if (bandData.metadata) {
            // Flatten metadata into the band level
            Object.assign(bandData, bandData.metadata);
            delete bandData.metadata;
          }
          if (bandData.url) {
            delete bandData.url;
          }
        });
      }

      delete cleaned.id;
      delete cleaned.file_name;

      // Recursively clean nested objects
      Object.keys(cleaned).forEach(
        (key) => (cleaned[key] = removeUnwantedFields(cleaned[key]))
      );

      return cleaned;
    }
    return data;
  };

  const renderObject = (obj: any, level = 0) => {
    return (
      <div className={`ml-${level * 4} border-l border-gray-200 pl-2`}>
        {Object.entries(obj).map(([key, value]) => (
          <div key={key} className="mb-2">
            {typeof value === "object" && value !== null ? (
              <Collapsible key={key} title={key}>
                {renderObject(value, level + 1)}
              </Collapsible>
            ) : (
              <div className="text-xs">
                <span className="font-semibold capitalize">{key.replace('_', ' ')}: </span>
                <span>{value?.toString()}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white">
      <h3 className="font-semibold mb-4">Information</h3>
      {metadata ? (
        <div className="my-2">{renderObject(metadata)}</div>
      ) : (
        <p>No metadata available</p>
      )}
    </div>
  );
}

const Collapsible = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div
        className="flex justify-between items-center cursor-pointer hover:text-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold capitalize">{title.replace("_", " ")}</span>
        <button className="text-sm">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      {isOpen && <div className="ml-4 mt-2">{children}</div>}
    </div>
  );
};

export default Information;
