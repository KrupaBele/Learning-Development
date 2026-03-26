import React, { useState } from "react";

// Define the type for company details
type CompanyDetail = {
  companyName: string;
  numberOfEmployees: number;
  selectIndustry: string;
  headquartersLocation: string;
  websiteURL: string;
};

const SignUp = () => {
  // Define the state for company details
  const [companyDetails, setCompanyDetails] = useState<CompanyDetail[]>([
    {
      companyName: "Default Company",
      numberOfEmployees: 1,
      selectIndustry: "Default Industry",
      headquartersLocation: "Default Location",
      websiteURL: "http://example.com",
    },
  ]);

  // Function to handle company detail updates
  const updateCompanyDetail = (
    index: number,
    key: keyof CompanyDetail,
    value: string
  ) => {
    setCompanyDetails((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [key]: value, // Dynamically update the specific field
      };
      return updated;
    });
  };

  // Handle the form submission (for example, for sending data to an API)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted company details:", companyDetails);
    // You can send the `companyDetails` to your backend here.
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl mb-4">Sign Up</h2>
          {companyDetails.map((company, index) => (
            <div key={index} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor={`companyName-${index}`}>Company Name</label>
                <input
                  id={`companyName-${index}`}
                  type="text"
                  value={company.companyName}
                  onChange={(e) =>
                    updateCompanyDetail(index, "companyName", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor={`numberOfEmployees-${index}`}>
                  Number of Employees
                </label>
                <input
                  id={`numberOfEmployees-${index}`}
                  type="number"
                  value={company.numberOfEmployees}
                  onChange={(e) =>
                    updateCompanyDetail(
                      index,
                      "numberOfEmployees",
                      e.target.value
                    )
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor={`selectIndustry-${index}`}>
                  Select Industry
                </label>
                <input
                  id={`selectIndustry-${index}`}
                  type="text"
                  value={company.selectIndustry}
                  onChange={(e) =>
                    updateCompanyDetail(index, "selectIndustry", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor={`headquartersLocation-${index}`}>
                  Headquarters Location
                </label>
                <input
                  id={`headquartersLocation-${index}`}
                  type="text"
                  value={company.headquartersLocation}
                  onChange={(e) =>
                    updateCompanyDetail(
                      index,
                      "headquartersLocation",
                      e.target.value
                    )
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor={`websiteURL-${index}`}>Website URL</label>
                <input
                  id={`websiteURL-${index}`}
                  type="text"
                  value={company.websiteURL}
                  onChange={(e) =>
                    updateCompanyDetail(index, "websiteURL", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded mt-4"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
