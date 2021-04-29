import { useState, useCallback, useEffect } from 'react';
import './App.scss';
import { VscFeedback } from "react-icons/vsc";
import { IoMdClose } from "react-icons/io";
import axios from "axios";

function App() {
  const [classRating, setClassRating] = useState("");
  const [point, setPoint] = useState(0);
  const [classSubmitForm, setClassSubmitForm] = useState("");
  const [answers, setAnswers] = useState([]);
  const [email, setEmail] = useState("");
  const [pointResponse, setPointResponse] = useState(null)
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    async function fetchQuestions() {
      const response = await axios.get("http://188.166.247.65:3000/questions")
      
      setQuestions(response.data)

      const generateAnswers = response.data.map(v => {
        return {
          id: v.id,
          answer: ""
        }
      })

      setAnswers(generateAnswers)
    }

    fetchQuestions()
  }, [])


  const handleClickPoint = useCallback(async (i) => {
    setPoint(i)
    
    const response = await axios.post("http://188.166.247.65:3000/rates/add_point", {
        point: i
      }, {
        headers: {
          "content-type": "application/json; charset=utf-8"
        }
      }
    )

    setPointResponse(response.data.id)

    setTimeout(() => {
      setPoint(0);
      setClassRating("");
      setClassSubmitForm("increase-height")
    },3000)   
  }, [])

  const handleSetAnswer = useCallback((value, index, questionId) => {
    const newAnswers = answers.map(v => Object.assign({}, v));
    newAnswers[index].id = questionId;
    newAnswers[index].answer = value;

    setAnswers(newAnswers)
  }, [answers])

  const handleSubmit = async () => {
    if (answers.length === 0 || answers.some(v => v.answer.trim().length === 0)) {
      return alert("Your feedback can not be empty!")
    }

    await axios.put(`http://188.166.247.65:3000/rates/${pointResponse}`, {
        email,
      }, {
        headers: {
          "content-type": "application/json; charset=utf-8"
        }
      }
    )

    await axios.post("http://188.166.247.65:3000/answers", {
        email,
        questions: answers
      }, {
        headers: {
          "content-type": "application/json; charset=utf-8"
        }
      }
    )

    const generateAnswers = questions.map(v => {
      return {
        id: v.id,
        answer: ""
      }
    })

    setAnswers(generateAnswers)
    setClassSubmitForm("")
    setEmail("")
    setClassRating("increase-panel-height")
    setPoint(1)
    setTimeout(() => {
      setClassRating("")
      setPoint(0)
    }, 3000)
  }

  return (
    <div className="App">
      <div className="App-header">
        <div className="customer-icon-wrapper" onClick={() => setClassRating("increase-panel-height")}>
          <VscFeedback className="customer-icon" size="1em" color="#000" />

          <p className="improve-text">Help Us Improve</p>

        </div>
        <div className={`panel-rating ${classRating}`}>
          <IoMdClose className="close-icon" onClick={() => setClassRating("")} color="#000" />

          {point === 0 && <div className="rating-point-wrapper">
            {new Array(5).fill(null).map((v,i) => 
              <div 
                key={i}
                className="rating-point-item"
                onClick={() => {
                  handleClickPoint(i+1)
                }}
              >
                {i + 1}
              </div>
            )}
          </div> }

          {point !== 0 && <p className="thank-for-review">Thank for your review</p>}
        </div>

        <div className={`panel-submit-form ${classSubmitForm}`}>
          <IoMdClose className="close-icon" onClick={() => setClassSubmitForm("")} color="#000" />
          
          {answers.length > 0 && questions.map((q, i) => {
            return (
              <div key={q.id} className="input-group">
                <p className="title">{q.content}</p>
                <textarea
                  value={answers[i].answer}
                  className="text-area-answer-input"
                  onChange={(v) => handleSetAnswer(v.target.value, i, q.id)}
                />
              </div>
            )
          })}

          <div className="input-group">
            <p className="title">Email</p>
            <input 
              value={email}
              onChange={v => setEmail(v.target.value)} 
              className="answer-input" />
          </div>

          <div className="input-group">
            <button className="submit-btn" onClick={handleSubmit}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
