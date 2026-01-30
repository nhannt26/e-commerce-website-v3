import { useEffect, useState } from "react";
import { recommendationAPI } from "../services/api";

export function useRecommendation(userId, limit = 8) {
  const [products, setProducts] = useState([]);
  const [source, setSource] = useState("personalized");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    recommendationAPI.getItemCF(userId, limit)
      .then(res => {
        console.log("RAW RESPONSE", res.data);

        setProducts(res.data.data || []);
        setSource(res.data.source || "personalized");
      })
      .catch(err => {
        console.error("Recommendation error", err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [userId, limit]);

  return { products, source, loading };
}