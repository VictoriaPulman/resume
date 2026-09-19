
// ==========================================
// Z-ТЕСТ ДЛЯ A/B/n ТЕСТИРОВАНИЯ
// Все варианты сравниваются попарно
// Поправка Бонферрони применяется
// ==========================================


// ------------------------------------------
// ИСХОДНЫЕ ДАННЫЕ
// ------------------------------------------

let variants = [
    {
        name: "A",
        conversions: 80,
        sample: 1000
    },
    {
        name: "B",
        conversions: 125,
        sample: 1000
    }
];


// ------------------------------------------
// ЭЛЕМЕНТЫ СТРАНИЦЫ
// ------------------------------------------

const container =
    document.getElementById("variantsContainer");

const addButton =
    document.getElementById("addVariant");

const removeButton =
    document.getElementById("removeVariant");

const variantCount =
    document.getElementById("variantCount");

const confidenceSlider =
    document.getElementById("confidence");

const confidenceValue =
    document.getElementById("confidenceValue");

const comparison =
    document.getElementById("comparison");

const mainConclusion =
    document.getElementById("mainConclusion");

const resultDescription =
    document.getElementById("resultDescription");


// ------------------------------------------
// ФУНКЦИЯ ERROR FUNCTION
// Нужна для нормального распределения
// ------------------------------------------

function erf(x) {

    const sign =
        x >= 0 ? 1 : -1;

    x = Math.abs(x);

    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const t =
        1 / (1 + p * x);

    const y =
        1 -
        (
            (
                (
                    (
                        a5 * t +
                        a4
                    ) * t +
                    a3
                ) * t +
                a2
            ) * t +
            a1
        ) *
        t *
        Math.exp(-x * x);

    return sign * y;
}


// ------------------------------------------
// CDF НОРМАЛЬНОГО РАСПРЕДЕЛЕНИЯ
// ------------------------------------------

function normalCDF(z) {

    return (
        0.5 *
        (
            1 +
            erf(
                z / Math.sqrt(2)
            )
        )
    );
}


// ------------------------------------------
// КРИТИЧЕСКОЕ Z
// Для доверительного интервала
// ------------------------------------------

function zCritical(confidence) {

    const alpha =
        1 - confidence;

    const a1 = -39.6968302866538;
    const a2 = 220.946098424521;
    const a3 = -275.928510446969;
    const a4 = 138.357751867269;
    const a5 = -30.6647980661472;
    const a6 = 2.50662827745924;

    const b1 = -54.4760987982241;
    const b2 = 161.585836858041;
    const b3 = -155.698979859887;
    const b4 = 66.8013118877197;
    const b5 = -13.2806815528857;

    const c1 = -0.00778489400243029;
    const c2 = -0.322396458041136;
    const c3 = -2.40075827716184;
    const c4 = -2.54973253934373;
    const c5 = 4.37466414146497;
    const c6 = 2.93816398269878;

    const d1 = 0.00778469570904146;
    const d2 = 0.32246712907004;
    const d3 = 2.445134137143;
    const d4 = 3.75440866190742;

    const p =
        1 - alpha / 2;

    let q;
    let r;


    if (p < 0.02425) {

        q =
            Math.sqrt(
                -2 * Math.log(p)
            );

        return (
            (
                (
                    (
                        (
                            c1 * q +
                            c2
                        ) * q +
                        c3
                    ) * q +
                    c4
                ) * q +
                c5
            ) * q +
            c6
        ) /
        (
            (
                (
                    (
                        d1 * q +
                        d2
                    ) * q +
                    d3
                ) * q +
                d4
            ) * q +
            1
        );
    }


    if (p > 1 - 0.02425) {

        q =
            Math.sqrt(
                -2 *
                Math.log(1 - p)
            );

        return -(
            (
                (
                    (
                        (
                            c1 * q +
                            c2
                        ) * q +
                        c3
                    ) * q +
                    c4
                ) * q +
                c5
            ) * q +
            c6
        ) /
        (
            (
                (
                    (
                        d1 * q +
                        d2
                    ) * q +
                    d3
                ) * q +
                d4
            ) * q +
            1
        );
    }


    q =
        p - 0.5;

    r =
        q * q;


    return (
        (
            (
                (
                    (
                        a1 * r +
                        a2
                    ) * r +
                    a3
                ) * r +
                a4
            ) * r +
            a5
        ) * r +
        a6
    ) * q /
    (
        (
            (
                (
                    (
                        b1 * r +
                        b2
                    ) * r +
                    b3
                ) * r +
                b4
            ) * r +
            b5
        ) * r +
        1
    );
}


// ------------------------------------------
// ДОВЕРИТЕЛЬНЫЙ ИНТЕРВАЛ
// Wilson interval
// ------------------------------------------

function confidenceInterval(
    successes,
    total,
    confidence
) {

    if (
        total <= 0 ||
        successes < 0 ||
        successes > total
    ) {

        return {
            low: 0,
            high: 0
        };
    }


    const p =
        successes / total;

    const z =
        zCritical(confidence);

    const denominator =
        1 +
        (
            z * z
        ) / total;


    const centre =
        (
            p +
            (
                z * z
            ) / (
                2 * total
            )
        ) /
        denominator;


    const margin =
        z *
        Math.sqrt(
            (
                p *
                (1 - p) +
                (
                    z * z
                ) / 4 / total
            ) /
            total
        ) /
        denominator;


    return {

        low:
            Math.max(
                0,
                centre - margin
            ),

        high:
            Math.min(
                1,
                centre + margin
            )

    };
}


// ------------------------------------------
// Z-ТЕСТ ДВУХ ПРОПОРЦИЙ
// ------------------------------------------

function proportionZTest(a, b) {

    const p1 =
        a.conversions /
        a.sample;

    const p2 =
        b.conversions /
        b.sample;


    // Объединённая пропорция
    const pooled =
        (
            a.conversions +
            b.conversions
        ) /
        (
            a.sample +
            b.sample
        );


    const standardError =
        Math.sqrt(
            pooled *
            (1 - pooled) *
            (
                1 / a.sample +
                1 / b.sample
            )
        );


    if (
        !isFinite(standardError) ||
        standardError === 0
    ) {

        return {
            z: 0,
            pValue: 1
        };
    }


    const z =
        (
            p1 - p2
        ) /
        standardError;


    // Двусторонний тест
    const pValue =
        2 *
        (
            1 -
            normalCDF(
                Math.abs(z)
            )
        );


    return {
        z: z,
        pValue: pValue
    };
}


// ------------------------------------------
// ФОРМАТ ПРОЦЕНТА
// ------------------------------------------

function formatPercent(value) {

    return (
        value * 100
    ).toLocaleString(
        "ru-RU",
        {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }
    ) + "%";
}


// ------------------------------------------
// ФОРМАТ P-VALUE
// ------------------------------------------

function formatPValue(value) {

    if (value < 0.0001) {

        return "< 0,0001";
    }


    return value.toLocaleString(
        "ru-RU",
        {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4
        }
    );
}


// ------------------------------------------
// СОЗДАНИЕ ОДНОГО СРАВНЕНИЯ
// ------------------------------------------

function createComparison(
    first,
    second,
    alphaCorrected,
    confidence
) {

    const test =
        proportionZTest(
            first,
            second
        );


    const pValue =
        test.pValue;


    const significant =
        pValue <
        alphaCorrected;


    const firstConversion =
        first.conversions /
        first.sample;


    const secondConversion =
        second.conversions /
        second.sample;


    let winnerText;


    if (
        Math.abs(
            firstConversion -
            secondConversion
        ) < 0.000000001
    ) {

        winnerText =
            "Конверсия одинаковая";

    } else if (
        firstConversion >
        secondConversion
    ) {

        winnerText =
            `Вариант ${first.name} показывает более высокую конверсию`;

    } else {

        winnerText =
            `Вариант ${second.name} показывает более высокую конверсию`;
    }


    const item =
        document.createElement("div");

    item.className =
        "comparison-item";


    item.innerHTML = `

        <div class="comparison-top">

            <span class="comparison-name">

                ${first.name}
                vs
                ${second.name}

            </span>


            <span class="p-value">

                p-value =
                ${formatPValue(pValue)}

            </span>

        </div>


        <div class="comparison-result">

            ${winnerText}

        </div>


        <div
            class="
                comparison-result
                ${
                    significant
                        ? "significant"
                        : "not-significant"
                }
            "
            style="margin-top: 8px;"
        >

            ${
                significant
                    ? "✓ Разница статистически значима"
                    : "○ Статистически значимой разницы нет"
            }

        </div>

    `;


    comparison.appendChild(item);


    return {

        first: first,
        second: second,
        pValue: pValue,
        significant: significant,

        firstConversion:
            firstConversion,

        secondConversion:
            secondConversion,

        confidence:
            confidence

    };
}


// ------------------------------------------
// ОТРИСОВКА ВАРИАНТОВ
// ------------------------------------------

function renderVariants() {

    container.innerHTML = "";


    const confidence =
        Number(
            confidenceSlider.value
        ) / 100;


    variants.forEach(
        (
            variant,
            index
        ) => {

            const conversion =
                variant.sample > 0
                    ? variant.conversions /
                      variant.sample
                    : 0;


            const interval =
                confidenceInterval(
                    variant.conversions,
                    variant.sample,
                    confidence
                );


            const row =
                document.createElement("div");


            row.className =
                "variant-row";


            row.innerHTML = `

                <div class="variant-name">

                    <span class="variant-badge">

                        ${variant.name}

                    </span>

                    Вариант ${variant.name}

                </div>


                <input

                    class="data-input"

                    type="number"

                    min="0"

                    value="${variant.conversions}"

                    data-index="${index}"

                    data-field="conversions"

                >


                <input

                    class="data-input"

                    type="number"

                    min="1"

                    value="${variant.sample}"

                    data-index="${index}"

                    data-field="sample"

                >


                <div class="calculated">

                    ${formatPercent(conversion)}

                </div>


                <div class="interval">

                    ${formatPercent(interval.low)}
                    –
                    ${formatPercent(interval.high)}

                </div>

            `;


            container.appendChild(row);

        }
    );


    document
        .querySelectorAll(".data-input")
        .forEach(
            input => {

                input.addEventListener(
                    "input",
                    handleInput
                );

            }
        );


    variantCount.textContent =
        variants.length;


    calculateResults();
}


// ------------------------------------------
// ОБРАБОТКА ВВОДА
// ------------------------------------------

function handleInput(event) {

    const index =
        Number(
            event.target.dataset.index
        );


    const field =
        event.target.dataset.field;


    let value =
        Number(
            event.target.value
        );


    if (isNaN(value)) {

        value = 0;
    }


    if (field === "sample") {

        value =
            Math.max(
                1,
                Math.floor(value)
            );


        // Если выборка уменьшилась
        // ниже количества конверсий

        if (
            variants[index].conversions >
            value
        ) {

            variants[index].conversions =
                value;
        }
    }


    if (field === "conversions") {

        value =
            Math.max(
                0,
                Math.floor(value)
            );


        if (
            value >
            variants[index].sample
        ) {

            value =
                variants[index].sample;
        }
    }


    variants[index][field] =
        value;


    renderVariants();
}


// ------------------------------------------
// ДОБАВИТЬ ВАРИАНТ
// ------------------------------------------

addButton.addEventListener(
    "click",
    () => {

        if (
            variants.length >= 10
        ) {

            return;
        }


        const nextLetter =
            String.fromCharCode(
                65 +
                variants.length
            );


        variants.push({

            name:
                nextLetter,

            conversions:
                0,

            sample:
                1000

        });


        renderVariants();

    }
);


// ------------------------------------------
// УДАЛИТЬ ВАРИАНТ
// ------------------------------------------

removeButton.addEventListener(
    "click",
    () => {

        if (
            variants.length <= 2
        ) {

            return;
        }


        variants.pop();

        renderVariants();

    }
);


// ------------------------------------------
// ПОЛЗУНОК ДОСТОВЕРНОСТИ
// ------------------------------------------

confidenceSlider.addEventListener(
    "input",
    () => {

        confidenceValue.textContent =
            confidenceSlider.value +
            "%";


        renderVariants();

    }
);


// ------------------------------------------
// ОСНОВНОЙ РАСЧЁТ
// ------------------------------------------

function calculateResults() {

    comparison.innerHTML = "";


    if (
        variants.length < 2
    ) {

        mainConclusion.textContent =
            "Добавьте минимум два варианта.";

        resultDescription.textContent =
            "Для проведения Z-теста нужны минимум два варианта.";

        return;
    }


    const confidence =
        Number(
            confidenceSlider.value
        ) / 100;


    const alpha =
        1 - confidence;


    // --------------------------------------
    // СКОЛЬКО БУДЕТ ПОПАРНЫХ СРАВНЕНИЙ
    //
    // Например:
    // 2 варианта = 1
    // 3 варианта = 3
    // 4 варианта = 6
    // 5 вариантов = 10
    // --------------------------------------

    const numberOfComparisons =
        (
            variants.length *
            (variants.length - 1)
        ) / 2;


    // --------------------------------------
    // ПОПРАВКА БОНФЕРРОНИ
    // --------------------------------------

    const correctedAlpha =
        alpha /
        numberOfComparisons;


    const results = [];


    // --------------------------------------
    // СРАВНИВАЕМ КАЖДЫЙ С КАЖДЫМ
    // --------------------------------------

    for (
        let i = 0;
        i < variants.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < variants.length;
            j++
        ) {

            const result =
                createComparison(
                    variants[i],
                    variants[j],
                    correctedAlpha,
                    confidence
                );


            results.push(result);
        }
    }


    // --------------------------------------
    // СТАТИСТИКА
    // --------------------------------------

    const significantCount =
        results.filter(
            result =>
                result.significant
        ).length;


    // --------------------------------------
    // НАХОДИМ ВАРИАНТ С МАКСИМАЛЬНОЙ
    // ФАКТИЧЕСКОЙ КОНВЕРСИЕЙ
    // --------------------------------------

    const sorted =
        [...variants].sort(
            (a, b) => {

                const rateA =
                    a.conversions /
                    a.sample;

                const rateB =
                    b.conversions /
                    b.sample;

                return rateB - rateA;
            }
        );


    const best =
        sorted[0];


    const bestRate =
        best.conversions /
        best.sample;


    // --------------------------------------
    // ПРОВЕРЯЕМ:
    // ЗНАЧИМО ЛИ ПРЕИМУЩЕСТВО ЛУЧШЕГО
    // НАД КАЖДЫМ ОСТАЛЬНЫМ
    // --------------------------------------

    const bestComparisons =
        results.filter(
            result =>
                result.first.name === best.name ||
                result.second.name === best.name
        );


    const bestIsSignificantlyBetter =
        bestComparisons.length > 0 &&
        bestComparisons.every(
            result => {

                if (
                    !result.significant
                ) {

                    return false;
                }


                if (
                    result.first.name === best.name
                ) {

                    return (
                        result.firstConversion >
                        result.secondConversion
                    );

                } else {

                    return (
                        result.secondConversion >
                        result.firstConversion
                    );
                }

            }
        );


    // --------------------------------------
    // ИТОГОВЫЙ ВЫВОД
    // --------------------------------------

    if (
        bestIsSignificantlyBetter
    ) {

        mainConclusion.textContent =
            `Вариант ${best.name} имеет статистически значимо ` +
            `более высокую конверсию, чем каждый из остальных вариантов. ` +
            `Конверсия — ${formatPercent(bestRate)}.`;

        resultDescription.textContent =
            `Из ${numberOfComparisons} попарных сравнений ` +
            `${significantCount} показали статистически значимые различия. ` +
            `Поправка Бонферрони учтена.`;

    } else if (
        significantCount > 0
    ) {

        mainConclusion.textContent =
            `Вариант ${best.name} имеет самую высокую фактическую ` +
            `конверсию — ${formatPercent(bestRate)}, ` +
            `но его преимущество не подтверждено статистически ` +
            `по всем сравнениям.`;

        resultDescription.textContent =
            `Статистически значимые различия обнаружены ` +
            `в ${significantCount} из ${numberOfComparisons} ` +
            `попарных сравнений.`;

    } else {

        mainConclusion.textContent =
            `Статистически значимых различий между вариантами ` +
            `не обнаружено. Самая высокая фактическая конверсия ` +
            `у варианта ${best.name} — ${formatPercent(bestRate)}.`;

        resultDescription.textContent =
            `Ни одно из ${numberOfComparisons} попарных сравнений ` +
            `не достигло уровня значимости при достоверности ` +
            `${confidenceSlider.value}% с поправкой Бонферрони.`;
    }
}


// ------------------------------------------
// ПЕРВЫЙ ЗАПУСК
// ------------------------------------------

renderVariants();
