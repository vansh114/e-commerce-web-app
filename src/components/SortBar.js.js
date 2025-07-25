import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const sortOptions = [
  { value: "", label: "Default" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "title", label: "Title: A-Z" },
  { value: "-title", label: "Title: Z-A" },
  { value: "-averageRating", label: "Rating: High to Low" },
  { value: "averageRating", label: "Rating: Low to High" }
];

const SortBar = () => {
  const [selectedSort, setSelectedSort] = useState("relevance");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSelectedSort(params.get("sort") || "relevance");
  }, [location.search]);

  const handleSortChange = (value) => {
    setSelectedSort(value);
    const params = new URLSearchParams(location.search);
    if (value && value !== "relevance") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    navigate({ search: params.toString() });
  };

  return (
    <div className="bg-white border-bottom mb-3 p-3">
      <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
        <span className="fw-semibold me-2" style={{fontSize: "1.05rem"}}>Sort By</span>
        {sortOptions.map(option => (
          <button
            key={option.value}
            className={`btn btn-link px-2 py-0 ${selectedSort === option.value ? "fw-bold text-primary border-0 border-bottom border-primary" : "text-dark"} `}
            style={{
              textDecoration: "none",
              borderRadius: 0,
              borderWidth: "2px",
              borderStyle: selectedSort === option.value ? "solid" : "none",
              borderColor: selectedSort === option.value ? "#1976d2" : "transparent",
              boxShadow: "none",
              fontSize: "1.05rem",
              minWidth: "unset"
            }}
            onClick={() => handleSortChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortBar;