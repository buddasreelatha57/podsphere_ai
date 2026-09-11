import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import RelatedPodcastCard from "../../components/dashboard/RelatedPodcastCard";
import api from "../../services/api";
import "./SearchResults.css";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get(`/content/search?q=${encodeURIComponent(query)}`);
        if (res.data && res.data.success) {
          setResults(res.data.content || []);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <DashboardLayout>
      <div className="search-results-page">
        <h2 className="search-title">Search Results for "{query}"</h2>
        
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <SearchX size={64} className="empty-icon" />
            <h3>No results found</h3>
            <p>We couldn't find any podcasts matching your search.</p>
          </div>
        ) : (
          <div className="results-grid">
            {results.map((item) => (
              <RelatedPodcastCard key={item._id} podcast={item} onClick={() => {
                window.location.href = `/watch/${item._id}`;
              }} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
