import getData from "@/actions/getData";

const DebugPage = async() => {
    console.log("DebugPage component is rendering");
    const data = await getData('playlists');
    console.log("Fetched data:", data);

    return ( 
        <div>
            <h1>Debug Page</h1>
            {JSON.stringify(data)}
        </div>
    );
}

export default DebugPage;