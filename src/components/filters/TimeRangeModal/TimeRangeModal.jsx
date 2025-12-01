import { useState, useEffect } from 'react'
import './TimeRangeModal.css'

function TimeRangeModal({ isOpen, onClose, onSelect, currentSelection }) {
  const [selectedOption, setSelectedOption] = useState('All-time')
  const [customStartYear, setCustomStartYear] = useState('')
  const [customEndYear, setCustomEndYear] = useState('')
  const [showCustomRange, setShowCustomRange] = useState(false)

  // Sync with current selection when modal opens
  useEffect(() => {
    if (isOpen && currentSelection) {
      if (currentSelection === 'All-time' || currentSelection === 'all-time') {
        setSelectedOption('All-time')
        setShowCustomRange(false)
      } else if (currentSelection === 'This Year') {
        setSelectedOption('This Year')
        setShowCustomRange(false)
      } else if (currentSelection === 'Last Year') {
        setSelectedOption('Last Year')
        setShowCustomRange(false)
      } else if (currentSelection.includes('-') && !currentSelection.includes('s')) {
        // Custom range format: "2020-2024"
        setSelectedOption('Custom Range')
        const [start, end] = currentSelection.split('-')
        setCustomStartYear(start.trim())
        setCustomEndYear(end.trim())
        setShowCustomRange(true)
      } else {
        // Default to All-time for unknown formats
        setSelectedOption('All-time')
        setShowCustomRange(false)
      }
    } else if (isOpen) {
      // Default to All-time if no current selection
      setSelectedOption('All-time')
      setShowCustomRange(false)
    }
  }, [isOpen, currentSelection])

  if (!isOpen) return null

  const timeOptions = [
    {
      value: 'All-time',
      label: 'All-time',
      description: 'All releases'
    },
    {
      value: 'This Year',
      label: 'This Year',
      description: new Date().getFullYear().toString()
    },
    {
      value: 'Last Year',
      label: 'Last Year',
      description: (new Date().getFullYear() - 1).toString()
    },
    {
      value: 'Custom Range',
      label: 'Custom Range',
      description: 'Select a specific time period'
    }
  ]

  const handleOptionChange = (value) => {
    setSelectedOption(value)
    if (value === 'Custom Range') {
      setShowCustomRange(true)
    } else {
      setShowCustomRange(false)
      if (onSelect) {
        onSelect(value)
      }
      onClose()
    }
  }

  const handleCustomRangeSubmit = () => {
    if (customStartYear && customEndYear) {
      const range = `${customStartYear}-${customEndYear}`
      if (onSelect) {
        onSelect(range)
      }
      onClose()
    }
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <>
      <div className="time-range-modal-overlay" onClick={handleClose}></div>
      <div className="time-range-modal-wrapper">
        <div className="time-range-modal" onClick={(e) => e.stopPropagation()}>
          {/* Radio Options List */}
          <div className="time-range-radio-group">
            {timeOptions.map((option) => (
              <label 
                key={option.value}
                className="time-range-radio-option"
              >
                <input
                  type="radio"
                  name="timeRangeOption"
                  value={option.value}
                  checked={selectedOption === option.value}
                  onChange={() => handleOptionChange(option.value)}
                />
                <div className="time-range-option-content">
                  <span className="time-range-option-label">{option.label}</span>
                  <span className="time-range-option-description">{option.description}</span>
                </div>
              </label>
            ))}
          </div>

          {/* Custom Range Input */}
          {showCustomRange && (
            <div className="custom-range-section">
              <div className="custom-range-inputs">
                <div className="custom-range-input-group">
                  <label>Start Year</label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={customStartYear}
                    onChange={(e) => setCustomStartYear(e.target.value)}
                    placeholder="e.g., 2020"
                  />
                </div>
                <div className="custom-range-input-group">
                  <label>End Year</label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={customEndYear}
                    onChange={(e) => setCustomEndYear(e.target.value)}
                    placeholder="e.g., 2024"
                  />
                </div>
              </div>
              <button 
                className="custom-range-submit-btn"
                onClick={handleCustomRangeSubmit}
                disabled={!customStartYear || !customEndYear}
              >
                Apply Range
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default TimeRangeModal

