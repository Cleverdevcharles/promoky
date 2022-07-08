import Link from 'next/link'

const Hero = () => {
    return (
        <section className="hero-slider">
		{/* Single Slider */}
		<div className="single-slider" style={{height:"80vh"}}>
			<div className="container">
				<div className="row no-gutters">
					<div className="col-lg-9 offset-lg-3 col-12">
						<div className="text-inner">
							<div className="row">
								<div className="col-lg-7 col-12">
									<div className="hero-text">
										<h1><span>UP TO 20% DISCOUNT </span>For NFT Holders</h1>
										<p>Get +20% dicount on each product you purchase today. <br /> Availabile only for NFT holders.</p>
										<div className="btn">
											<Link href="/shop" className="btn">Shop Now!</Link>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		{/* End Single Slider */}
	</section>
    )
}

export default Hero