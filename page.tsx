import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Image from "next/image"

export default function About() {
  return (
    <div>
      <Header />

      {/* About Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About Service.in</h1>
          <p>Your trusted platform for finding professional service providers</p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="our-story">
        <div className="container">
          <div className="story-grid">
            <div className="story-content">
              <h2>Our Story</h2>
              <p>
                Service.in was founded in 2020 with a simple mission: to connect skilled service professionals with
                customers who need their expertise. What started as a small platform in Faisalabad has now grown to
                serve multiple cities across Pakistan.
              </p>
              <p>
                Our founder, Ahmed Khan, experienced firsthand the challenge of finding reliable service providers when
                he moved to a new city. This frustration led to the creation of Service.in - a platform that vets and
                verifies professionals before connecting them with customers.
              </p>
              <p>
                Today, we&apos;re proud to have helped thousands of customers find the right professionals for their
                needs, while providing service providers with a platform to grow their business and reach new customers.
              </p>
            </div>
            <div className="story-image">
              <Image src="/placeholder.svg?height=400&width=600" width={600} height={400} alt="Service.in Team" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="mission-values">
        <div className="container">
          <h2 className="text-center">Our Mission & Values</h2>
          <p className="text-center mb-5">
            We&apos;re guided by our commitment to excellence and customer satisfaction
          </p>

          <div className="values-grid">
            <div className="value-card">
              <span className="value-icon">🔍</span>
              <h3>Quality</h3>
              <p>
                We rigorously vet all service providers to ensure they meet our high standards of professionalism and
                expertise.
              </p>
            </div>
            <div className="value-card">
              <span className="value-icon">🤝</span>
              <h3>Trust</h3>
              <p>Building trust between customers and service providers is at the core of everything we do.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">⚡</span>
              <h3>Efficiency</h3>
              <p>We strive to make the process of finding and booking services as quick and seamless as possible.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">💼</span>
              <h3>Opportunity</h3>
              <p>
                We create economic opportunities for service professionals to grow their business and improve their
                livelihoods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2 className="text-center">Meet Our Team</h2>
          <p className="text-center mb-5">The dedicated people behind Service.in</p>

          <div className="team-grid">
            <div className="team-member">
              <Image
                src="/placeholder.svg?height=200&width=200"
                width={200}
                height={200}
                alt="Ahmed Khan"
                className="rounded-full"
              />
              <h3>Ahmed Khan</h3>
              <p className="position">Founder & CEO</p>
            </div>
            <div className="team-member">
              <Image
                src="/placeholder.svg?height=200&width=200"
                width={200}
                height={200}
                alt="Fatima Ali"
                className="rounded-full"
              />
              <h3>Fatima Ali</h3>
              <p className="position">Chief Operations Officer</p>
            </div>
            <div className="team-member">
              <Image
                src="/placeholder.svg?height=200&width=200"
                width={200}
                height={200}
                alt="Usman Malik"
                className="rounded-full"
              />
              <h3>Usman Malik</h3>
              <p className="position">Head of Technology</p>
            </div>
            <div className="team-member">
              <Image
                src="/placeholder.svg?height=200&width=200"
                width={200}
                height={200}
                alt="Ayesha Ahmed"
                className="rounded-full"
              />
              <h3>Ayesha Ahmed</h3>
              <p className="position">Customer Relations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>5,000+</h3>
              <p>Service Providers</p>
            </div>
            <div className="stat-item">
              <h3>50,000+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat-item">
              <h3>100,000+</h3>
              <p>Completed Jobs</p>
            </div>
            <div className="stat-item">
              <h3>10+</h3>
              <p>Cities Covered</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
