import { Typography } from '@material-tailwind/react'
import React from 'react'
import Nav from './Nav'
import Footer from './Footer'

const TandC = () => {
    return (
        <>
            <Nav />
            <div className='px-5'>
                <Typography className='my-2' variant="h5">Terms and Conditions of Use</Typography>
                <Typography className='my-2' variant="lead">1.Terms </Typography>
                <Typography variant="paragraph">
                    By accessing this Website, accessible from [website name], you are agreeing to be bound by
                    these Website Terms and Conditions of Use and agree that you are responsible for the agreement
                    with any applicable local laws. If you disagree with any of these terms, you are prohibited from
                    accessing this site. The materials contained in this Website are protected by copyright and trade mark
                    law.
                </Typography>
                <Typography className='my-2' variant="lead">2. Use License</Typography>
                <Typography variant='paragraph'>
                    Permission is granted to temporarily download one copy of the materials on [website name]'s Website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                    <span className='block my-2 ml-5'>
                        <li>modify or copy the materials;</li>
                        <li>use the materials for any commercial purpose or for any public display;</li>
                        <li>attempt to reverse engineer any software contained on [website name]'s Website;</li>
                        <li>remove any copyright or other proprietary notations from the materials; or</li>
                        <li>transferring the materials to another person or "mirror" the materials on any other server.</li>
                    </span>
                    This will let [website name] to terminate upon violations of any of these restrictions. Upon termination, your viewing right will also be terminated and you should destroy any downloaded materials in your possession whether it is printed or electronic format.

                </Typography>


                <Typography className='my-2' variant="lead"> 3. Disclaimer</Typography>
                <Typography variant='paragraph'>
                    All the materials on [website name]'s Website are provided "as is". [website name] makes no warranties, may it be expressed or implied, therefore negates all other warranties. Furthermore, [website name] does not make any representations concerning the accuracy or reliability of the use of the materials on its Website or otherwise relating to such materials or any sites linked to this Website.
                </Typography>

                <Typography className='my-2' variant="lead"> 4. Limitations
                </Typography>
                <Typography variant='paragraph'>
                    [website name] or its suppliers will not be hold accountable for any damages that will arise with the use or inability to use the materials on [website name]'s Website, even if [website name] or an authorize representative of this Website has been notified, orally or written, of the possibility of such damage. Some jurisdiction does not allow limitations on implied warranties or limitations of liability for incidental damages, these limitations may not apply to you.
                </Typography>

                <Typography className='my-2' variant="lead">5. Revisions and Errata </Typography>
                <Typography variant='paragraph'>
                    The materials appearing on [website name]'s Website may include technical, typographical, or photographic errors. [website name] will not promise that any of the materials in this Website are accurate, complete, or current. [website name] may change the materials contained on its Website at any time without notice. [website name] does not make any commitment to update the materials.
                </Typography>

                <Typography className='my-2' variant="lead">6. Links</Typography>
                <Typography variant='paragraph'>
                    [website name] has not reviewed all of the sites linked to its Website and is not responsible for the contents of any such linked site. The presence of any link does not imply endorsement by [website name] of the site. The use of any linked website is at the user's own risk.
                </Typography>

                <Typography className='my-2' variant="lead">7. Site Terms of Use Modifications </Typography>
                <Typography variant='paragraph'>
                    [website name] may revise these Terms of Use for its Website at any time without prior notice. By using this Website, you are agreeing to be bound by the current version of these Terms and Conditions of Use.
                </Typography>

                <Typography className='my-2' variant="lead">8. Governing Law</Typography>
                <Typography variant='paragraph'>
                    Any claim related to [website name]'s Website shall be governed by the laws of au without regards to its conflict of law provisions.
                </Typography>
            </div>
            <Footer />
        </>
    )
}

export default TandC