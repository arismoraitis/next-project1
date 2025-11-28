import Image from "next/image";
import homeImg from 'public/home.jpg';

export default function Home() {
  return (
      <>
          <div>

          <h1>Home Page</h1>
         <Image
             src={homeImg}
             alt="Home Page"
             />
          </div>

      </>
  );
}
