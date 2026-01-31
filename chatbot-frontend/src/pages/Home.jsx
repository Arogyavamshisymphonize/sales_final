import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Clock,
    DollarSign,
    BarChart2,
    Map,
    AlertTriangle,
    TrendingUp,
    Zap,
    Target,
    CheckCircle,
    Users,
    ShoppingBag,
    Briefcase,
    Rocket,
    Shield,
    Clock3
} from 'lucide-react';
import './Home.css';

export default function Home() {
    return (
        <div className="home-page">
            {/* Navigation */}
            <nav className="home-nav">
                <div className="nav-brand">
                    <SparklesIcon />
                    <span>Marketing Agent</span>
                </div>
                <div className="nav-links">
                    <Link to="/login" className="nav-link">Login</Link>
                    <Link to="/signup" className="nav-cta">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">AI Marketing Strategist</div>
                    <h1>Transform Your Business Growth with <span className="text-gradient">AI-Powered Marketing Intelligence</span></h1>
                    <p className="hero-description">
                        Stop guessing and start growing. Get consultant-level marketing strategies, real-time market insights, and actionable roadmaps in minutes.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/signup" className="primary-button">
                            Start Free Trial <ArrowRight size={20} />
                        </Link>
                        <Link to="/login" className="secondary-button">
                            View Demo
                        </Link>
                    </div>
                </div>
            </header>

            {/* The Problem Section */}
            <section className="section problem-section">
                <div className="container">
                    <h2 className="section-title">The Problem</h2>
                    <p className="section-subtitle">Marketing challenges faced by growing businesses today</p>

                    <div className="grid-3">
                        <ProblemCard
                            icon={<Clock size={32} />}
                            title="Time-Consuming Research"
                            description="Business owners spend 15-20 hours/week on marketing research instead of core operations."
                        />
                        <ProblemCard
                            icon={<DollarSign size={32} />}
                            title="High Consulting Costs"
                            description="Professional marketing consultants charge $5,000-$50,000+ per project."
                        />
                        <ProblemCard
                            icon={<BarChart2 size={32} />}
                            title="Lack of Data-Driven Insights"
                            description="Most small businesses rely on guesswork rather than market intelligence."
                        />
                        <ProblemCard
                            icon={<Map size={32} />}
                            title="No Actionable Roadmap"
                            description="Generic marketing advice fails to provide step-by-step implementation plans."
                        />
                        <ProblemCard
                            icon={<AlertTriangle size={32} />}
                            title="Missed Opportunities"
                            description="Delayed decision-making leads to lost market share and revenue."
                        />
                    </div>
                </div>
            </section>

            {/* Why This Matters Section */}
            <section className="section impact-section/bg-tertiary">
                <div className="container">
                    <h2 className="section-title">Why This Matters</h2>
                    <p className="section-subtitle">The business impact of unsolved marketing challenges</p>

                    <div className="impact-grid">
                        <ImpactItem
                            stat="82%"
                            text="of small businesses fail due to cash flow problems caused by ineffective marketing."
                        />
                        <ImpactItem
                            stat="3x"
                            text="Faster market capture by competitors who act on insights immediately."
                        />
                        <ImpactItem
                            stat="40%"
                            text="of marketing budgets wasted on ineffective campaigns due to lack of strategy."
                        />
                        <ImpactItem
                            stat="313%"
                            text="Higher likelihood of success for companies with documented strategies."
                        />
                    </div>
                </div>
            </section>

            {/* Our Solution Section */}
            <section className="section solution-section">
                <div className="container">
                    <h2 className="section-title">Our Solution</h2>
                    <p className="section-subtitle">How AI Marketing Strategist transforms your marketing approach</p>

                    <div className="steps-container">
                        <Step
                            number="1"
                            title="Conversational Product Discovery"
                            desc="Simply describe your product/service through an intuitive chat interface."
                        />
                        <Step
                            number="2"
                            title="Real-Time Market Intelligence"
                            desc="AI researches your industry, competitors, and opportunities using live web data."
                        />
                        <Step
                            number="3"
                            title="Customized Strategy Generation"
                            desc="Receive 3-5 data-backed marketing strategies tailored to your business."
                        />
                        <Step
                            number="4"
                            title="Actionable Implementation Guide"
                            desc="Get step-by-step execution plans with recommended tools and timelines."
                        />
                        <Step
                            number="5"
                            title="Direct Delivery"
                            desc="Strategies delivered instantly via email — ready to execute immediately."
                        />
                    </div>
                </div>
            </section>

            {/* Who Benefits Section */}
            <section className="section benefits-section bg-tertiary">
                <div className="container">
                    <h2 className="section-title">Who Benefits</h2>
                    <div className="grid-3">
                        <BenefitCard icon={<Rocket />} title="Startup Founders" desc="Launch products with proven go-to-market strategies." />
                        <BenefitCard icon={<Briefcase />} title="Small Business Owners" desc="Compete with larger players using data-driven insights." />
                        <BenefitCard icon={<Target />} title="Product Managers" desc="Validate and promote new features effectively." />
                        <BenefitCard icon={<Users />} title="Marketing Teams" desc="Accelerate research and strategy development." />
                        <BenefitCard icon={<Zap />} title="Entrepreneurs" desc="Build brand presence without agency costs." />
                        <BenefitCard icon={<ShoppingBag />} title="E-commerce Sellers" desc="Optimize marketing for faster sales growth." />
                    </div>
                </div>
            </section>

            {/* Key Benefits (Outcomes) Section */}
            <section className="section outcomes-section">
                <div className="container">
                    <h2 className="section-title">Key Benefits & Outcomes</h2>
                    <div className="outcomes-grid">
                        <OutcomeItem icon={<Clock3 />} title="Save 100+ Hours/Month" desc="Automate research that would take weeks." />
                        <OutcomeItem icon={<DollarSign />} title="Reduce Costs by 90%" desc="Get consultant-level strategies for a fraction of the cost." />
                        <OutcomeItem icon={<Zap />} title="Make Faster Decisions" desc="Receive actionable insights in minutes, not weeks." />
                        <OutcomeItem icon={<TrendingUp />} title="Increase Campaign ROI" desc="Data-backed strategies improve effectiveness by up to 40%." />
                        <OutcomeItem icon={<Shield />} title="Stay Competitive" desc="Access real-time market intelligence." />
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="section comparison-section bg-tertiary">
                <div className="container">
                    <h2 className="section-title">Why AI-Powered Strategy Wins</h2>
                    <div className="comparison-table">
                        <div className="comparison-card traditional">
                            <h3>Traditional Consultant</h3>
                            <div className="price">$5,000 - $50,000+</div>
                            <p>Takes 2-4 weeks</p>
                            <p>Requires multiple meetings</p>
                        </div>
                        <div className="comparison-card inhouse">
                            <h3>In-House Research</h3>
                            <div className="price">80+ Hours</div>
                            <p>Diverts focus from core business</p>
                            <p>Often incomplete data</p>
                        </div>
                        <div className="comparison-card ai-powered highlight">
                            <div className="card-badge">Best Value</div>
                            <h3>AI Marketing Strategist</h3>
                            <div className="price">$49 - $149 / month</div>
                            <p>Instant delivery</p>
                            <p>Unlimited sessions</p>
                            <p>Always up-to-date insights</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section cta-section">
                <div className="cta-content">
                    <h2>Ready to Transform Your Marketing?</h2>
                    <p>Join thousands of businesses using AI to grow faster.</p>
                    <Link to="/signup" className="primary-button large">
                        Get Started Now <ArrowRight size={24} />
                    </Link>
                </div>
            </section>

            <footer className="home-footer">
                <p>© 2026 AI Marketing Strategist. All rights reserved.</p>
            </footer>
        </div>
    );
}

// Helper Components
function SparklesIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    );
}

function ProblemCard({ icon, title, description }) {
    return (
        <div className="card problem-card">
            <div className="icon-wrapper red">{icon}</div>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}

function ImpactItem({ stat, text }) {
    return (
        <div className="impact-item">
            <div className="stat">{stat}</div>
            <p>{text}</p>
        </div>
    );
}

function Step({ number, title, desc }) {
    return (
        <div className="step-item">
            <div className="step-number">{number}</div>
            <div className="step-content">
                <h3>{title}</h3>
                <p>{desc}</p>
            </div>
        </div>
    );
}

function BenefitCard({ icon, title, desc }) {
    return (
        <div className="card benefit-card">
            <div className="icon-wrapper blue">{icon}</div>
            <h3>{title}</h3>
            <p>{desc}</p>
        </div>
    );
}

function OutcomeItem({ icon, title, desc }) {
    return (
        <div className="outcome-item">
            <div className="icon-wrapper green">{icon}</div>
            <div>
                <h4>{title}</h4>
                <p>{desc}</p>
            </div>
        </div>
    );
}
