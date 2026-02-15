import { useEffect, useRef } from 'react'

const AnimatedBackground = ({ isDark = true }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId
    let particles = []
    let triangles = []
    let waves = []

    // Theme-aware colors
    const theme = {
      dark: {
        bg: '#0B0F19',
        particles: ['#06b6d4', '#ec4899', '#3b82f6', '#a855f7'],
        triangles: ['#3b82f6', '#ec4899', '#a855f7', '#06b6d4'],
        connections: ['#06b6d4', '#ec4899', '#3b82f6'],
        waves: ['#06b6d4', '#a855f7', '#ec4899']
      },
      light: {
        bg: '#ffffff',
        particles: ['#0891b2', '#db2777', '#2563eb', '#9333ea'],
        triangles: ['#2563eb', '#db2777', '#9333ea', '#0891b2'],
        connections: ['#0891b2', '#db2777', '#2563eb'],
        waves: ['#0891b2', '#9333ea', '#db2777']
      }
    }

    const colors = isDark ? theme.dark : theme.light

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Particle class for network nodes
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.radius = Math.random() * 2.5 + 1.5
        this.opacity = isDark ? Math.random() * 0.6 + 0.4 : Math.random() * 0.4 + 0.3
        this.color = colors.particles[Math.floor(Math.random() * colors.particles.length)]
        this.pulseSpeed = Math.random() * 0.02 + 0.01
        this.pulsePhase = Math.random() * Math.PI * 2
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.pulsePhase += this.pulseSpeed

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1
      }

      draw() {
        const pulse = Math.sin(this.pulsePhase) * 0.3 + 1
        const currentRadius = this.radius * pulse

        ctx.beginPath()
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.globalAlpha = this.opacity
        ctx.fill()
        
        // Enhanced glow effect
        ctx.shadowBlur = isDark ? 15 : 10
        ctx.shadowColor = this.color
        ctx.fill()
        
        // Extra bright center
        ctx.shadowBlur = isDark ? 25 : 15
        ctx.globalAlpha = this.opacity * 0.8
        ctx.fill()
        
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
      }
    }

    // Triangle class for floating shapes
    class Triangle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 40 + 25
        this.vx = (Math.random() - 0.5) * 0.4
        this.vy = (Math.random() - 0.5) * 0.4
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.03
        this.opacity = isDark ? Math.random() * 0.2 + 0.08 : Math.random() * 0.15 + 0.05
        this.color = colors.triangles[Math.floor(Math.random() * colors.triangles.length)]
        this.pulseSpeed = Math.random() * 0.015 + 0.01
        this.pulsePhase = Math.random() * Math.PI * 2
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.rotation += this.rotationSpeed
        this.pulsePhase += this.pulseSpeed

        // Wrap around edges
        if (this.x < -this.size) this.x = canvas.width + this.size
        if (this.x > canvas.width + this.size) this.x = -this.size
        if (this.y < -this.size) this.y = canvas.height + this.size
        if (this.y > canvas.height + this.size) this.y = -this.size
      }

      draw() {
        const pulse = Math.sin(this.pulsePhase) * 0.2 + 1
        const currentSize = this.size * pulse

        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.globalAlpha = this.opacity

        ctx.beginPath()
        ctx.moveTo(0, -currentSize / 2)
        ctx.lineTo(currentSize / 2, currentSize / 2)
        ctx.lineTo(-currentSize / 2, currentSize / 2)
        ctx.closePath()

        // Fill with gradient
        const gradient = ctx.createLinearGradient(
          -currentSize / 2, -currentSize / 2,
          currentSize / 2, currentSize / 2
        )
        gradient.addColorStop(0, this.color)
        gradient.addColorStop(1, this.color + '80')
        ctx.fillStyle = gradient
        ctx.fill()

        // Stroke
        ctx.strokeStyle = this.color
        ctx.lineWidth = isDark ? 1.5 : 1
        ctx.stroke()

        ctx.globalAlpha = 1
        ctx.restore()
      }
    }

    // Wave class for particle wave effects
    class Wave {
      constructor(index) {
        this.points = []
        this.numPoints = 50
        this.amplitude = 80 + Math.random() * 40
        this.frequency = 0.01 + Math.random() * 0.01
        this.speed = 0.02 + Math.random() * 0.02
        this.offset = index * 200
        this.phase = 0
        this.y = (canvas.height / 4) * (index + 1)
        this.color = colors.waves[index % colors.waves.length]
        this.opacity = isDark ? 0.15 : 0.1
        
        // Initialize points
        for (let i = 0; i < this.numPoints; i++) {
          this.points.push({
            x: (canvas.width / this.numPoints) * i,
            baseY: this.y
          })
        }
      }

      update() {
        this.phase += this.speed
      }

      draw() {
        ctx.beginPath()
        ctx.globalAlpha = this.opacity

        for (let i = 0; i < this.points.length; i++) {
          const point = this.points[i]
          const x = point.x
          const y = point.baseY + Math.sin(x * this.frequency + this.phase) * this.amplitude

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }

          // Draw small dots along the wave
          if (i % 3 === 0) {
            ctx.save()
            ctx.fillStyle = this.color
            ctx.globalAlpha = this.opacity * 1.5
            ctx.shadowBlur = isDark ? 8 : 5
            ctx.shadowColor = this.color
            ctx.beginPath()
            ctx.arc(x, y, 2, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
          }
        }

        ctx.strokeStyle = this.color
        ctx.lineWidth = isDark ? 2 : 1.5
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    }

    // Initialize particles (network nodes)
    const particleCount = 100
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Initialize triangles
    const triangleCount = 18
    for (let i = 0; i < triangleCount; i++) {
      triangles.push(new Triangle())
    }

    // Initialize waves
    const waveCount = 3
    for (let i = 0; i < waveCount; i++) {
      waves.push(new Wave(i))
    }

    // Draw connections between nearby particles
    const drawConnections = () => {
      const maxDistance = 180
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * (isDark ? 0.25 : 0.15)
            
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            
            // Gradient line
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            )
            gradient.addColorStop(0, particles[i].color)
            gradient.addColorStop(1, particles[j].color)
            
            ctx.strokeStyle = gradient
            ctx.globalAlpha = opacity
            ctx.lineWidth = isDark ? 1.5 : 1
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        }
      }
    }

    // Animation loop
    const animate = () => {
      // Clear canvas with theme-aware background
      ctx.fillStyle = colors.bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw waves first (background layer)
      waves.forEach(wave => {
        wave.update()
        wave.draw()
      })

      // Draw triangles (mid layer)
      triangles.forEach(triangle => {
        triangle.update()
        triangle.draw()
      })

      // Draw connections
      drawConnections()

      // Draw particles (foreground layer)
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isDark])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: isDark ? 0.95 : 0.85 }}
    />
  )
}

export default AnimatedBackground
