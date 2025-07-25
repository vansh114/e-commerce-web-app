import loading from './loading.gif'

const Spinner = () => {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
            <div className="text-center">
                <img 
                    src={loading} 
                    alt="Loading..." 
                    className="img-fluid shadow-lg rounded-circle"
                    style={{ 
                        width: "50px",
                        height: "50px",
                        objectFit: "contain",
                        filter: "drop-shadow(0 0 8px rgba(0,0,0,0.1))"
                    }}
                />
            </div>
        </div>
    )
}

export default Spinner;