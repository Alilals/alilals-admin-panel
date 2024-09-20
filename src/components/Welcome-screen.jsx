import Link from "next/link";

const WelcomeScreen = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen max-h-[94vh]">
      {/* Main Content */}
      <div className="flex-grow p-6 flex flex-col justify-center items-center bg-gray-50">
        {/* Welcome Text */}
        <h1 className="text-4xl font-bold text-purple-600 mb-4 text-center">
          Welcome to the Alilals Admin Panel
        </h1>
        <p className="text-lg text-gray-700 mb-6 text-center">
          Manage your agricultural operations, settings, blog posts, and more,
          right from here!
        </p>

        {/* CTA Button */}
        <Link href="https://google.com" target="_blank">
          <div className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-500 transition-colors">
            Visit Main Website
          </div>
        </Link>
      </div>

      {/* Illustration */}
      {/* <div className="hidden md:block w-1/2 h-full bg-gray-100">
        <img
          src="https://source.unsplash.com/featured/?farm,agriculture" // Replace with your chosen image or illustration
          alt="Agriculture Illustration"
          className="object-cover w-full h-full"
        />
      </div> */}
    </div>
  );
};

export default WelcomeScreen;
