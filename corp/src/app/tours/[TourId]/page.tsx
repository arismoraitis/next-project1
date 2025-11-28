

export default function ToursIdPage({params}: {params:{TourId:string}}) {


    return (

        <>
            <div>
                <h1 className="text-4xl">ID: {params.TourId}</h1>

            </div>

        </>
    );
}

