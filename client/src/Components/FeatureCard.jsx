import React from 'react'
import { Card, CardBody, Typography } from "@material-tailwind/react";

const FeatureCard = ({ img, title, description }) => {
    return (
        <>
            <Card className="mt-6 w-96">
                <CardBody>
                    <img className="mb-4 h-12 w-12" src={img} alt="Multiple Format" />
                    <Typography variant="h5" color="blue-gray" className="mb-2">
                        {title}
                    </Typography>
                    <Typography>
                        {description}
                    </Typography>
                </CardBody>
            </Card>
        </>
    )
}

export default FeatureCard