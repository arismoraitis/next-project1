const url = 'https://www.course-api.com/react-tours-project';

type Tour = {
    id: string;
    name: string;
    info: string;
    image: string;
    price: string;
};

const fetchTour = async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const response = await fetch(url);
    const data: Tour[] = await response.json();
    return data;
};

export default async function ToursPage () {

    const data = await fetchTour();

    return (

        <>
    <section>

        <h1 className="text-3xl mb-4">Tours</h1>
        {data.map((tour) => {
            return <h2 key={tour.id}>{tour.name}</h2>
        })}
    </section>

        </>
    )
}

