import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchActivePromo } from "../../redux/slices/promo.slice";

const PromoBanner = () => {
  const dispatch = useDispatch();
  const { activePromo, loading } = useSelector((state) => state.promo);

  useEffect(() => {
    dispatch(fetchActivePromo());
  }, [dispatch]);

  if (loading) return null;
  if (!activePromo) return null;

  return (
    <Link to="/shop?onSale=true" className="block w-full">
      <img
        src={activePromo.image}
        alt="Promo"
        className="w-full h-auto object-cover cursor-pointer aspect-[1920/750] md:aspect-[1920/350]"
      />
    </Link>
  );
};

export default PromoBanner;
