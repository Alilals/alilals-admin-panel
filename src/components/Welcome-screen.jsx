import Link from "next/link";

const WelcomeScreen = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Main Content */}
      <div className="flex-grow p-6 flex flex-col justify-center items-center bg-gradient-to-br from-green-700 via-green-500 to-green-300 animate-gradient-x">
        {/* Welcome Text */}
        <h1 className="text-5xl font-extrabold text-white mb-4 text-center drop-shadow-lg animate-bounce">
          Welcome to the Alilals Admin Panel
        </h1>
        <p className="text-lg text-gray-100 mb-6 text-center max-w-xl drop-shadow-md animate-fade-in">
          Manage your agricultural services, products, settings, blog posts, and
          more, right from here!
        </p>

        {/* CTA Button */}
        <Link href="https://google.com" target="_blank">
          <div className="bg-white text-green-700 px-8 py-4 rounded-full font-semibold hover:bg-green-600 hover:text-white transition-transform transform hover:scale-105 shadow-lg">
            Visit Main Website
          </div>
        </Link>
      </div>

      {/* Illustration (Optional) */}
      {/* <div className="hidden md:block w-1/2 h-full bg-gray-100">
        <img
          src="https://source.unsplash.com/featured/?farm,agriculture"
          alt="Agriculture Illustration"
          className="object-cover w-full h-full"
        />
      </div> */}
    </div>
  );
};

export default WelcomeScreen;
