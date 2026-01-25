import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchAllOrders } from "../../redux/slices/order.slice";
import orderService from "../../services/order.service";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";
import Loader from "../../components/common/Loader";

const Dashboard = () => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch stats
        const statsResponse = await orderService.getDashboardStats();
        setStats(statsResponse.data.stats);

        // Fetch orders
        dispatch(fetchAllOrders());
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dispatch]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Admin Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatPrice(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/products"
              className="p-4 border rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
            >
              <h3 className="font-semibold mb-2">Manage Products</h3>
              <p className="text-sm text-gray-600">
                Add, edit, or remove products
              </p>
            </a>

            <a
              href="/admin/hero"
              className="p-4 border rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
            >
              <h3 className="font-semibold mb-2">Manage Hero</h3>
              <p className="text-sm text-gray-600">
                Edit homepage hero section
              </p>
            </a>

            <a
              href="/admin/orders"
              className="p-4 border rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
            >
              <h3 className="font-semibold mb-2">Manage Orders</h3>
              <p className="text-sm text-gray-600">
                View and update order status
              </p>
            </a>

            <a
              href="/admin/users"
              className="p-4 border rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
            >
              <h3 className="font-semibold mb-2">Manage Users</h3>
              <p className="text-sm text-gray-600">
                View users and create admins
              </p>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              Welcome to the admin dashboard! Here you can manage all aspects of
              the e-commerce platform.
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Monitor sales and revenue in real-time</li>
              <li>Add new products and update existing ones</li>
              <li>Manage customer orders and update status</li>
              <li>Create new admin accounts for team members</li>
              <li>View and manage all registered users</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
