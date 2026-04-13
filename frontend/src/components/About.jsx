import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-10 px-4">

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">

        {/* TITLE */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800">
          About Us
        </h1>

        {/* DIVIDER */}
        <div className="w-20 h-1 bg-red-500 mx-auto mb-8 rounded"></div>

        {/* CONTENT */}
        <p className="mb-4 text-gray-600 leading-relaxed">
          Welcome to our platform — a dedicated OTT space created especially for 
          independent filmmakers and creative storytellers.
        </p>

        <p className="mb-4 text-gray-600 leading-relaxed">
          Our mission is to provide a platform where talented filmmakers can showcase 
          their short films, web series, and independent cinema to a wider audience. 
          We believe that great stories deserve to be seen, regardless of budget or background.
        </p>

        <p className="mb-4 text-gray-600 leading-relaxed">
          This platform allows creators who own 100% rights to their content, including 
          footage, music, and other elements, to distribute their films and reach viewers 
          who appreciate original storytelling.
        </p>

        <p className="mb-4 text-gray-600 leading-relaxed">
          Viewers can watch films on the platform through a paid access model, helping 
          support independent creators and encouraging the growth of new cinema.
        </p>

        <p className="mb-4 text-gray-600 leading-relaxed">
          We aim to build a community where creativity, originality, and independent filmmaking thrive.
        </p>

        {/* HIGHLIGHT BOX */}
        <div className="mt-8 p-5 bg-gray-50 border-l-4 border-red-500 rounded">
          <p className="font-semibold text-lg text-gray-800">
            Our goal is simple — to connect independent filmmakers with audiences 
            worldwide and give meaningful stories the platform they deserve.
          </p>
        </div>

      </div>
    </div>
  );
};

export default About;